/**
 * The signed-in user's profile, stored at users/{session.user.id} (users-uat outside production).
 *   GET   → { exists: false, account } before onboarding, { exists: true, profile } after.
 *   POST  → creates/completes the profile (onboarding). 400 invalid, 409 username taken.
 *   PATCH → edits displayName. 404 if there's no profile yet.
 */
import { NextResponse } from 'next/server';
import { FieldValue, Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { envCollection, getAdminDb } from '@/lib/firebaseAdmin';
import { TERMS_VERSION } from '@/lib/legal';
import {
  DISPLAY_NAME_MAX,
  isValidUsername,
  type Profile,
  type ProfileMeResponse,
} from '@/lib/profile';
import { requireSession } from '@/lib/requireSession';

const users = () => getAdminDb().collection(envCollection('users'));

const badRequest = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Firestore Timestamps → ISO strings so the profile serializes as plain JSON. */
function toProfile(data: DocumentData): Profile {
  const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : null);
  return {
    ...(data as Profile),
    createdAt: iso(data.createdAt),
    termsAcceptedAt: iso(data.termsAcceptedAt),
  };
}

/** Trimmed display name, `undefined` when empty, or `null` when not a string / too long. */
function parseDisplayName(value: unknown): string | undefined | null {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > DISPLAY_NAME_MAX) return null;
  return trimmed || undefined;
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const doc = await users().doc(session.user.id).get();
  const body: ProfileMeResponse = doc.exists
    ? { exists: true, profile: toProfile(doc.data() ?? {}) }
    : {
        exists: false,
        account: {
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          picture: session.user.image ?? null,
        },
      };
  return NextResponse.json(body);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await readJson(request);
  if (!body) return badRequest('Invalid JSON body');
  const { username, acceptedTerms } = body;
  if (!isValidUsername(username)) {
    return badRequest('Username must be 1–24 letters, numbers, "_" or "-"');
  }
  const displayName = parseDisplayName(body.displayName);
  if (displayName === null)
    return badRequest(`Display name must be ${DISPLAY_NAME_MAX} characters or fewer`);
  if (acceptedTerms !== true) return badRequest('You must accept the Terms and Privacy Policy');

  const uid = session.user.id;
  const usernameKey = username.toLowerCase();
  const db = getAdminDb();
  const ref = users().doc(uid);

  // Read the username owner and the current profile in one transaction, so two sign-ups can't
  // both claim the same username between the check and the write.
  const taken = await db.runTransaction(async (tx) => {
    const owners = await tx.get(users().where('usernameKey', '==', usernameKey).limit(2));
    if (owners.docs.some((d) => d.id !== uid)) return true;

    const current = await tx.get(ref);
    const existing = current.data();
    tx.set(
      ref,
      {
        username,
        usernameKey,
        displayName: displayName ?? username,
        email: session.user.email ?? null,
        photo: { gmailUrl: session.user.image ?? null },
        ...(current.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        termsAcceptedAt: FieldValue.serverTimestamp(),
        termsVersion: TERMS_VERSION,
        ...(existing?.plan ? {} : { plan: 'basic' }),
      },
      { merge: true },
    );
    return false;
  });

  if (taken) return badRequest('Username is already taken', 409);
  const saved = await ref.get();
  return NextResponse.json({ exists: true, profile: toProfile(saved.data() ?? {}) });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await readJson(request);
  if (!body) return badRequest('Invalid JSON body');
  const displayName = parseDisplayName(body.displayName);
  if (displayName === null)
    return badRequest(`Display name must be ${DISPLAY_NAME_MAX} characters or fewer`);

  const ref = users().doc(session.user.id);
  const doc = await ref.get();
  if (!doc.exists) return badRequest('Profile not found', 404);

  // An empty display name falls back to the username, as at sign-up.
  await ref.update({ displayName: displayName ?? doc.data()?.username });
  const saved = await ref.get();
  return NextResponse.json({ exists: true, profile: toProfile(saved.data() ?? {}) });
}
