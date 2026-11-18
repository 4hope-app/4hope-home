/**
 * The signed-in user's profile, stored at users/{session.user.id} (users-uat outside production).
 *   GET   → { exists: false, account } before onboarding, { exists: true, profile } after.
 *   POST  → creates/completes the profile (onboarding): username and displayName (the full
 *           name) are both required. 400 invalid, 409 username taken.
 *   PATCH → edits username, displayName and/or the photo ({ photo: dataUrl } or
 *           { removePhoto: true }). 400 invalid, 404 no profile yet, 409 username taken.
 * Every write also sets `updatedAt` (server time).
 */
import { NextResponse } from 'next/server';
import {
  FieldValue,
  envCollection,
  getAdminDb,
  timestampToDate,
  type DocumentData,
} from '@/lib/firestore';
import { TERMS_VERSION } from '@/lib/legal';
import { parsePhotoDataUrl } from '@/lib/photo';
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
  const iso = (v: unknown) => timestampToDate(v)?.toISOString() ?? null;
  return {
    ...(data as Profile),
    // Photo bytes stay out of the JSON (the page renders them server-side).
    photo: { gmailUrl: (data.photo?.gmailUrl as string | null | undefined) ?? null },
    createdAt: iso(data.createdAt),
    termsAcceptedAt: iso(data.termsAcceptedAt),
    updatedAt: iso(data.updatedAt),
  };
}

/** Trimmed full name, or null when missing, empty, not a string or too long. */
function parseDisplayName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= DISPLAY_NAME_MAX ? trimmed : null;
}

const DISPLAY_NAME_ERROR = `Full name is required (${DISPLAY_NAME_MAX} characters max)`;
const USERNAME_ERROR = 'Username must be 1–24 letters, numbers, "_" or "-"';

/** The JSON object body, or null. Requires `Content-Type: application/json`, which forms can't send. */
async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\s*(;|$)/i.test(type)) return null;
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
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;

  const body = await readJson(request);
  if (!body) return badRequest('Invalid JSON body');
  const { username, acceptedTerms } = body;
  if (!isValidUsername(username)) return badRequest(USERNAME_ERROR);
  const displayName = parseDisplayName(body.displayName);
  if (displayName === null) return badRequest(DISPLAY_NAME_ERROR);
  if (acceptedTerms !== true) return badRequest('You must accept the Terms and Privacy Policy');

  const uid = session.user.id;
  const usernameKey = username.toLowerCase();
  const ref = users().doc(uid);

  // Read the username owner and the current profile in one transaction, so two sign-ups can't
  // both claim the same username between the check and the write.
  const taken = await getAdminDb().runTransaction(async (tx) => {
    const owners = await tx.get(users().where('usernameKey', '==', usernameKey).limit(2));
    if (owners.docs.some((d) => d.id !== uid)) return true;

    const current = await tx.get(ref);
    const existing = current.data();
    tx.set(
      ref,
      {
        username,
        usernameKey,
        displayName,
        email: session.user.email ?? null,
        provider: session.user.provider,
        photo: { gmailUrl: session.user.image ?? null },
        ...(current.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        termsAcceptedAt: FieldValue.serverTimestamp(),
        termsVersion: TERMS_VERSION,
        ...(existing?.plan ? {} : { plan: 'basic' }),
        updatedAt: FieldValue.serverTimestamp(),
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
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;

  const body = await readJson(request);
  if (!body) return badRequest('Invalid JSON body');

  const updates: Record<string, unknown> = {};
  if ('displayName' in body) {
    const displayName = parseDisplayName(body.displayName);
    if (displayName === null) return badRequest(DISPLAY_NAME_ERROR);
    updates.displayName = displayName;
  }
  if ('username' in body) {
    if (!isValidUsername(body.username)) return badRequest(USERNAME_ERROR);
    updates.username = body.username;
    updates.usernameKey = body.username.toLowerCase();
  }
  if (body.removePhoto === true) {
    updates['photo.currentBytes'] = FieldValue.delete();
    updates['photo.contentType'] = FieldValue.delete();
  } else if (body.photo !== undefined) {
    const photo = parsePhotoDataUrl(body.photo);
    if (!photo) return badRequest('Photo must be a WebP, JPEG or PNG image of 200 KB or less');
    updates['photo.currentBytes'] = photo.bytes;
    updates['photo.contentType'] = photo.contentType;
  }

  const uid = session.user.id;
  const ref = users().doc(uid);

  // Same transaction as at sign-up: a new username must still be free when it's written.
  const result = await getAdminDb().runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (!current.exists) return 'missing' as const;
    const key = updates.usernameKey;
    if (key && key !== current.data()?.usernameKey) {
      const owners = await tx.get(users().where('usernameKey', '==', key).limit(2));
      if (owners.docs.some((d) => d.id !== uid)) return 'taken' as const;
    }
    if (Object.keys(updates).length) {
      tx.update(ref, { ...updates, updatedAt: FieldValue.serverTimestamp() });
    }
    return 'ok' as const;
  });

  if (result === 'missing') return badRequest('Profile not found', 404);
  if (result === 'taken') return badRequest('Username is already taken', 409);
  const saved = await ref.get();
  return NextResponse.json({ exists: true, profile: toProfile(saved.data() ?? {}) });
}
