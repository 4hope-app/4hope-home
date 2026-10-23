import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from './auth';

/**
 * For route handlers: the signed-in session, or a 401 response to return as-is.
 *   const s = await requireSession(); if (s instanceof NextResponse) return s;
 */
export async function requireSession(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return session;
}
