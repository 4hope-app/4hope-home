import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import type { DocumentData } from 'firebase-admin/firestore';
import { auth } from './auth';
import { envCollection, getAdminDb } from './firebaseAdmin';

/**
 * For protected server pages: the session and the user's profile document data.
 * Not signed in → /login (coming back to `path`); signed in without a profile → /register.
 */
export async function requireProfile(
  path: string,
): Promise<{ session: Session; profile: DocumentData }> {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);

  const doc = await getAdminDb().collection(envCollection('users')).doc(session.user.id).get();
  const profile = doc.data();
  if (!doc.exists || !profile?.username) redirect('/register');

  return { session, profile };
}
