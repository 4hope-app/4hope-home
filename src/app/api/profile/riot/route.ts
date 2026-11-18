/**
 * The signed-in user's linked Riot account, stored at users/{uid}.riot (shared with 4hope-webpage).
 * Linking happens through Riot Sign-On: GET ./connect → Riot → GET ./callback.
 *   PATCH  → re-checks Riot ID, rank and icon. 404 nothing linked, 429 within the cooldown.
 *   DELETE → unlinks it.
 * Errors are `{ error: RiotLinkResult }` codes; the UI maps them to copy.
 */
import { NextResponse } from 'next/server';
import { FieldValue, envCollection, getAdminDb } from '@/lib/firestore';
import { isRiotServer, type RiotLinkResult } from '@/lib/riot';
import { buildRiotRecord, riotApiKey, riotRefreshCooldownMs, toRiotView } from '@/lib/riotApi';
import { requireSession } from '@/lib/requireSession';

const users = () => getAdminDb().collection(envCollection('users'));

const fail = (error: RiotLinkResult, status: number) => NextResponse.json({ error }, { status });

export async function PATCH() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const ref = users().doc(session.user.id);
  const existing = (await ref.get()).data()?.riot as Record<string, unknown> | undefined;
  if (!existing || !isRiotServer(existing.server)) return fail('not_linked', 404);

  // Unverified links can always be retried; verified ones once per cooldown.
  const lastChecked = Date.parse(String(existing.lastCheckedAt ?? '')) || 0;
  if (existing.verified !== false && Date.now() - lastChecked < riotRefreshCooldownMs()) {
    return fail('cooldown', 429);
  }
  if (!riotApiKey()) return fail('unavailable', 503);

  const result = await buildRiotRecord(
    {
      puuid: typeof existing.puuid === 'string' ? existing.puuid : undefined,
      gameName: String(existing.gameName ?? ''),
      tagLine: String(existing.tagLine ?? ''),
    },
    existing.server,
    existing.linkedVia === 'rso' ? 'rso' : null,
  );
  if (result.status === 'not_found') return fail('not_found', 404);

  await ref.update({ riot: result.record });
  return NextResponse.json({ riot: await toRiotView(result.record) });
}

export async function DELETE() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const ref = users().doc(session.user.id);
  if ((await ref.get()).exists) await ref.update({ riot: FieldValue.delete() });
  return NextResponse.json({ riot: null });
}
