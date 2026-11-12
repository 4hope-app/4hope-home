/**
 * Firebase Admin (Firestore), server only. Credentials come from a service account:
 * FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (never NEXT_PUBLIC_).
 */
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Timestamp, getFirestore, type Firestore } from 'firebase-admin/firestore';

// Cached on globalThis so dev hot reloads reuse the instance (settings() can only run once).
const cache = globalThis as typeof globalThis & { __adminDb?: Firestore };

export function getAdminDb(): Firestore {
  if (cache.__adminDb) return cache.__adminDb;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // .env files keep the key on one line with literal "\n"s.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are missing: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  // REST instead of gRPC: works in serverless runtimes (Cloudflare Workers) without HTTP/2 sockets.
  db.settings({ preferRest: true });
  cache.__adminDb = db;
  return db;
}

/** Collection name for the current environment: `users` in production, `users-uat` elsewhere. */
export function envCollection(name: string): string {
  return process.env.APP_ENV === 'production' ? name : `${name}-uat`;
}

/**
 * A date field as a Date, or null. Accepts Firestore Timestamps (what this app writes) and ISO
 * strings (what other 4HOPE apps sharing the users collection write, e.g. `createdAt`).
 */
export function timestampToDate(value: unknown): Date | null {
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return value instanceof Timestamp ? value.toDate() : null;
}
