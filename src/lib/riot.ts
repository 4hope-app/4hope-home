/**
 * Riot account rules shared by the profile UI (client) and the /api/profile/riot routes (server).
 * Same servers and Firestore shape (`users/{uid}.riot`) as the 4hope-webpage app, which reads
 * and writes the same documents.
 */

/** Servers (platforms) a TFT account can play on, with Riot's platform id for each. */
export const RIOT_SERVERS = [
  { value: 'LAN', platform: 'la1' },
  { value: 'LAS', platform: 'la2' },
  { value: 'BR', platform: 'br1' },
  { value: 'NA', platform: 'na1' },
  { value: 'OCE', platform: 'oc1' },
  { value: 'EUW', platform: 'euw1' },
  { value: 'EUNE', platform: 'eun1' },
  { value: 'KR', platform: 'kr' },
  { value: 'JP', platform: 'jp1' },
] as const;

export type RiotServer = (typeof RIOT_SERVERS)[number]['value'];

export const isRiotServer = (value: unknown): value is RiotServer =>
  RIOT_SERVERS.some((s) => s.value === value);

/** Server for a Riot platform id ("LA1", "la1" → "LAN"), or null if unknown. */
export function serverFromPlatform(platform: unknown): RiotServer | null {
  if (typeof platform !== 'string') return null;
  const id = platform.toLowerCase();
  return RIOT_SERVERS.find((s) => s.platform === id)?.value ?? null;
}

/** A linked Riot account as the profile UI shows it. */
export interface RiotAccountView {
  gameName: string;
  tagLine: string;
  server: RiotServer;
  /** "GOLD", "MASTER"… or "Unranked". */
  tier: string | null;
  /** "I"–"IV" (empty for Master and above). */
  rank: string | null;
  lp: number | null;
  /** false when Riot couldn't be reached; retried on the next profile visit. */
  verified: boolean;
  /** true when linked by signing in to Riot (RSO), so ownership is proven. */
  ownershipVerified: boolean;
  iconUrl: string | null;
  lastCheckedAt: string | null;
}

/**
 * Outcome codes: errors of PATCH/DELETE /api/profile/riot, and the `?riot=` result the RSO
 * callback sends back to /profile. Mapped to copy in the dictionaries.
 */
export type RiotLinkResult =
  | 'linked'
  | 'denied'
  | 'failed'
  | 'taken'
  | 'not_found'
  | 'not_linked'
  | 'cooldown'
  | 'unavailable';

export const isRiotLinkResult = (value: unknown): value is RiotLinkResult =>
  typeof value === 'string' &&
  [
    'linked',
    'denied',
    'failed',
    'taken',
    'not_found',
    'not_linked',
    'cooldown',
    'unavailable',
  ].includes(value);
