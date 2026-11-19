/**
 * Auth.js (next-auth v5): Google sign-in, JWT session (no database adapter).
 * Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
 * No proxy/middleware: each protected page or route calls `auth()` itself.
 *
 * Shared session across 4hope.app subdomains: on 4hope.app (and its subdomains) the session
 * cookie gets `Domain=4hope.app`, so bracket.4hope.app and the other tools receive it too. They
 * read it with Auth.js and the same AUTH_SECRET and cookie name (SESSION_COOKIE). Any other host
 * (localhost, *.workers.dev previews) keeps a host-only cookie: a Domain the browser can't match
 * would make it drop the cookie and sign-in would silently fail there.
 */
import { headers } from 'next/headers';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { TRUSTED_DOMAIN } from './profile';

/** Auth.js' default session cookie name over https (the `__Secure-` prefix allows a Domain). */
export const SESSION_COOKIE = '__Secure-authjs.session-token';

/** Host of the request (x-forwarded-host first, as Auth.js does with AUTH_TRUST_HOST). */
function hostOf(h: Headers): string {
  const raw = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  return raw.split(',')[0].trim().replace(/:\d+$/, '').toLowerCase();
}

/** Whether cookies set for this host should be shared with every 4hope.app subdomain. */
export const sharesCookieDomain = (host: string) =>
  host === TRUSTED_DOMAIN || host.endsWith(`.${TRUSTED_DOMAIN}`);

async function config(request?: Request): Promise<NextAuthConfig> {
  // Route handlers under /api/auth get the request; auth() in pages/routes doesn't (it only
  // reads the cookie, never writes it), so fall back to the incoming headers.
  const host = hostOf(request ? request.headers : await headers());
  const shared = sharesCookieDomain(host);

  return {
    providers: [Google],
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    ...(shared && {
      cookies: {
        sessionToken: {
          name: SESSION_COOKIE,
          options: {
            domain: TRUSTED_DOMAIN,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
          },
        },
      },
    }),
    callbacks: {
      async jwt({ token, account }) {
        // providerAccountId = Google's stable "sub" → id of the users/{uid} document.
        if (account?.providerAccountId) {
          token.uid = account.providerAccountId;
          token.provider = account.provider;
        }
        return token;
      },
      async session({ session, token }) {
        if (token.uid && session.user) {
          session.user.id = token.uid;
          // Sessions issued before `provider` was stored were all Google.
          session.user.provider = token.provider ?? 'google';
        }
        return session;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);
