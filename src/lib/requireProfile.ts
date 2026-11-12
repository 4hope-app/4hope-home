import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import type { DocumentData } from 'firebase-admin/firestore';
import { auth } from './auth';
import { envCollection, getAdminDb } from './firebaseAdmin';
import { withCallback } from './profile';

/**
 * For protected server pages: the session and the user's profile document data.
 * Not signed in → /login (/en/login for English paths); signed in without a profile → /register
 * (Spanish only for now). Both come back to `path`.
 */
export async function requireProfile(
  path: string,
): Promise<{ session: Session; profile: DocumentData }> {
  const session = await auth();
  if (!session?.user)
    redirect(withCallback(path.startsWith('/en/') ? '/en/login' : '/login', path));

  const doc = await getAdminDb().collection(envCollection('users')).doc(session.user.id).get();
  const profile = doc.data();
  if (!doc.exists || !profile?.username) redirect(withCallback('/register', path));

  return { session, profile };
}
