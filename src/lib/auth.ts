/**
 * Auth.js (next-auth v5): Google sign-in, JWT session (no database adapter).
 * Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
 * No proxy/middleware: each protected page or route calls `auth()` itself.
 */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, account }) {
      // providerAccountId = Google's stable "sub" → id of the users/{uid} document.
      if (account?.providerAccountId) token.uid = account.providerAccountId;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid;
      return session;
    },
  },
});
