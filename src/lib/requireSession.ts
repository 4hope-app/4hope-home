import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from './auth';

/**
 * Whether a state-changing request comes from this site's own pages (CSRF guard). The session
 * cookie is SameSite=Lax, which stops other sites but not other *subdomains* of 4hope.app (same
 * site), and HTML forms can post bodies that parse as JSON. So for anything but GET/HEAD:
 *   - the Origin header, which browsers always send on POST/PATCH/DELETE, must be this host;
 *   - without Origin, Sec-Fetch-Site must not say the request is cross-origin.
 */
function isSameOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return !!host && new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const site = request.headers.get('sec-fetch-site');
  return !site || site === 'same-origin' || site === 'none';
}

/**
 * For route handlers: the signed-in session, or an error response to return as-is (401 not
 * signed in, 403 cross-origin write). Pass the request on every POST/PATCH/DELETE handler.
 *   const s = await requireSession(request); if (s instanceof NextResponse) return s;
 */
export async function requireSession(request?: Request): Promise<Session | NextResponse> {
  if (request && !isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request' }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return session;
}
