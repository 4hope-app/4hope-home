import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      /** Google account id (`sub`), also the id of the users/{uid} Firestore document. */
      id: string;
      /** Auth.js provider id used to sign in, e.g. "google". */
      provider: string;
    } & DefaultSession['user'];
  }
}

// `next-auth/jwt` re-exports JWT from @auth/core, so augment it where it is declared.
declare module '@auth/core/jwt' {
  interface JWT {
    uid?: string;
    provider?: string;
  }
}
