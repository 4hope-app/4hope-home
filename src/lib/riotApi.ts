/**
 * Server-only Riot access. Never import from a client component.
 *
 * - Riot Sign-On (RSO, OAuth 2 / OIDC): proves the player owns the Riot account. Needs
 *   RIOT_RSO_CLIENT_ID / RIOT_RSO_CLIENT_SECRET (granted by Riot to approved production apps).
 * - Riot API (RIOT_API_KEY): TFT profile icon and ranked entry for the linked puuid.
 *
 * The Firestore record keeps 4hope-webpage's fields (`gameName`, `tagLine`, `server`, `puuid`,
 * `profileIconId`, `tier`, `rank`, `lp`, `verified`, `verifiedAt`, `lastCheckedAt`) plus
 * `linkedVia: 'rso'`. No icon bytes (they need `sharp`, not on Workers): the icon is rebuilt from
 * `profileIconId` with Data Dragon.
 */
import { RIOT_SERVERS, type RiotAccountView, type RiotServer } from './riot';

const RANKED_TFT = 'RANKED_TFT';
const UNRANKED = 'Unranked';
const RSO_HOST = 'https://auth.riotgames.com';
// account-v1 answers for every account from any regional host.
const ACCOUNT_HOST = 'https://americas.api.riotgames.com';

export const riotApiKey = (): string | null => process.env.RIOT_API_KEY || null;

/** Minimum time between manual refreshes (RIOT_REFRESH_COOLDOWN_SECONDS, default 180 s). */
export const riotRefreshCooldownMs = (): number =>
  (Number(process.env.RIOT_REFRESH_COOLDOWN_SECONDS) || 180) * 1000;

// ---------------------------------------------------------------------------------------------
// Riot Sign-On

export function rsoConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.RIOT_RSO_CLIENT_ID;
  const clientSecret = process.env.RIOT_RSO_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** Riot's sign-in page. `cpid` adds the player's platform (e.g. "LA1") to the id token. */
export function rsoAuthorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid cpid',
    state,
  });
  return `${RSO_HOST}/authorize?${params}`;
}

/**
 * Exchanges the callback code for tokens and reads the signed-in Riot account.
 * The id token comes straight from Riot's token endpoint over TLS (code flow), so its claims are
 * read without re-verifying the signature.
 */
export async function rsoIdentity(
  code: string,
  redirectUri: string,
): Promise<{ puuid: string; gameName: string; tagLine: string; platform: string | null } | null> {
  const config = rsoConfig();
  if (!config) return null;
  try {
    const tokenRes = await fetch(`${RSO_HOST}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
    });
    if (!tokenRes.ok) {
      console.error(`RSO token exchange ${tokenRes.status}`);
      return null;
    }
    const tokens = (await tokenRes.json()) as { access_token?: string; id_token?: string };
    if (!tokens.access_token) return null;

    const accountRes = await fetch(`${ACCOUNT_HOST}/riot/account/v1/accounts/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    });
    if (!accountRes.ok) {
      console.error(`RSO accounts/me ${accountRes.status}`);
      return null;
    }
    const account = (await accountRes.json()) as {
      puuid: string;
      gameName?: string;
      tagLine?: string;
    };
    return {
      puuid: account.puuid,
      gameName: account.gameName ?? '',
      tagLine: account.tagLine ?? '',
      platform: idTokenClaim(tokens.id_token, 'cpid'),
    };
  } catch (err) {
    console.error('RSO request failed', err);
    return null;
  }
}

function idTokenClaim(idToken: string | undefined, claim: string): string | null {
  const payload = idToken?.split('.')[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const value = (JSON.parse(json) as Record<string, unknown>)[claim];
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Riot API

type FetchResult<T> = { ok: true; data: T } | { ok: false; status: number };

async function riotFetch<T>(url: string, apiKey: string): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey }, cache: 'no-store' });
    if (!res.ok) {
      console.error(`Riot API ${res.status} for ${new URL(url).pathname}`);
      return { ok: false, status: res.status };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    console.error('Riot API request failed', err);
    return { ok: false, status: 0 };
  }
}

const platformOf = (server: RiotServer) => RIOT_SERVERS.find((s) => s.value === server)!.platform;

type Summoner = { profileIconId: number; summonerLevel?: number };

/**
 * The server the player plays TFT on, when RSO didn't say: the one whose TFT summoner has the
 * highest level. LAN if they have no TFT summoner anywhere.
 */
async function detectServer(puuid: string, apiKey: string): Promise<RiotServer> {
  const found = await Promise.all(
    RIOT_SERVERS.map(async (s) => {
      const res = await riotFetch<Summoner>(
        `https://${s.platform}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`,
        apiKey,
      );
      return res.ok ? { server: s.value, level: res.data.summonerLevel ?? 0 } : null;
    }),
  );
  const best = found.filter((f) => f !== null).sort((a, b) => b.level - a.level)[0];
  return best?.server ?? 'LAN';
}

export type RiotRecord = Record<string, unknown>;

interface Identity {
  puuid?: string;
  gameName: string;
  tagLine: string;
}

/**
 * Builds the Firestore `riot` record for a Riot account.
 * - With a puuid (RSO link or refresh) the Riot ID is re-read by puuid, so name changes show up.
 * - Without one (an old 4hope-webpage link) it's looked up by Riot ID; 404 → not_found.
 * - An account that never played TFT is still linked, as Unranked with no icon.
 * - Riot unreachable / no API key: saved with `verified: false` and retried later.
 */
export async function buildRiotRecord(
  identity: Identity,
  server: RiotServer | null,
  linkedVia: 'rso' | null,
): Promise<{ status: 'not_found' } | { status: 'ok'; record: RiotRecord }> {
  const now = new Date().toISOString();
  // No undefined values: Firestore rejects them.
  const base = {
    gameName: identity.gameName,
    tagLine: identity.tagLine,
    ...(identity.puuid ? { puuid: identity.puuid } : {}),
    server: server ?? 'LAN',
    ...(linkedVia ? { linkedVia } : {}),
    lastCheckedAt: now,
  };
  const unverified = { status: 'ok' as const, record: { ...base, verified: false } };
  const apiKey = riotApiKey();
  if (!apiKey) return unverified;

  const account = await riotFetch<{ puuid: string; gameName?: string; tagLine?: string }>(
    identity.puuid
      ? `${ACCOUNT_HOST}/riot/account/v1/accounts/by-puuid/${identity.puuid}`
      : `${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(identity.gameName)}/${encodeURIComponent(identity.tagLine)}`,
    apiKey,
  );
  if (!account.ok) return account.status === 404 ? { status: 'not_found' } : unverified;
  const { puuid } = account.data;

  const finalServer = server ?? (await detectServer(puuid, apiKey));
  const platform = platformOf(finalServer);
  const [summoner, league] = await Promise.all([
    riotFetch<Summoner>(
      `https://${platform}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`,
      apiKey,
    ),
    riotFetch<{ queueType: string; tier: string; rank: string; leaguePoints: number }[]>(
      `https://${platform}.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`,
      apiKey,
    ),
  ]);
  // 404 = no TFT profile on this server: fine, the Riot account itself exists.
  if (!summoner.ok && summoner.status !== 404) return unverified;

  const ranked = league.ok ? league.data.find((e) => e.queueType === RANKED_TFT) : undefined;
  return {
    status: 'ok',
    record: {
      ...base,
      gameName: account.data.gameName ?? identity.gameName,
      tagLine: account.data.tagLine ?? identity.tagLine,
      server: finalServer,
      puuid,
      ...(summoner.ok ? { profileIconId: summoner.data.profileIconId } : {}),
      tier: ranked?.tier ?? UNRANKED,
      rank: ranked?.rank ?? '',
      lp: ranked?.leaguePoints ?? 0,
      verified: true,
      verifiedAt: now,
    },
  };
}

// Latest Data Dragon version, kept for a day per isolate (a hardcoded one goes stale and 403s).
let ddragon: { version: string; at: number } | null = null;

async function ddragonVersion(): Promise<string | null> {
  if (ddragon && Date.now() - ddragon.at < 86_400_000) return ddragon.version;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = (await res.json()) as string[];
    if (!versions[0]) return ddragon?.version ?? null;
    ddragon = { version: versions[0], at: Date.now() };
    return ddragon.version;
  } catch {
    return ddragon?.version ?? null;
  }
}

async function profileIconUrl(profileIconId: unknown): Promise<string | null> {
  if (typeof profileIconId !== 'number') return null;
  const version = await ddragonVersion();
  return version
    ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`
    : null;
}

/** The stored `riot` record (from either app) as the profile UI shows it. */
export async function toRiotView(record: RiotRecord): Promise<RiotAccountView> {
  const str = (v: unknown) => (typeof v === 'string' ? v : null);
  return {
    gameName: str(record.gameName) ?? '',
    tagLine: str(record.tagLine) ?? '',
    server: record.server as RiotServer,
    tier: str(record.tier),
    rank: str(record.rank),
    lp: typeof record.lp === 'number' ? record.lp : null,
    verified: record.verified !== false,
    ownershipVerified: record.linkedVia === 'rso',
    iconUrl: await profileIconUrl(record.profileIconId),
    lastCheckedAt: str(record.lastCheckedAt),
  };
}
