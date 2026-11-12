/**
 * Minimal Firestore client over the REST API, server only. Replaces firebase-admin, which can't
 * run on Cloudflare Workers (its protobuf layer generates code with `new Function`, which Workers
 * forbid). It covers exactly what this app uses, with the same shape as the Admin SDK:
 *   getAdminDb().collection(name).doc(id).get() / .update(data) / .set(data, { merge: true })
 *   collection.where(field, '==', value).limit(n).get()
 *   db.runTransaction(async (tx) => { tx.get(refOrQuery); tx.set(ref, data, { merge: true }); })
 *   FieldValue.serverTimestamp() / FieldValue.delete()
 *
 * Credentials come from a service account: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and
 * FIREBASE_PRIVATE_KEY (never NEXT_PUBLIC_). The OAuth access token is signed with WebCrypto.
 *
 * Value mapping: timestamps → Date, bytes → Buffer (and Buffer/Uint8Array → bytes), maps → plain
 * objects. Dotted keys in update() are field paths ("photo.contentType"), as in the Admin SDK.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocumentData = Record<string, any>;

const SCOPE = 'https://www.googleapis.com/auth/datastore';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── Sentinels ────────────────────────────────────────────────────────────────

class Sentinel {
  constructor(readonly kind: 'delete' | 'serverTimestamp') {}
}

export const FieldValue = {
  delete: () => new Sentinel('delete'),
  serverTimestamp: () => new Sentinel('serverTimestamp'),
};

// ─── Credentials and access token ─────────────────────────────────────────────

interface Credentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function credentials(): Credentials {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // .env files and dashboard secrets often keep the key on one line with literal "\n"s.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firestore credentials are missing: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }
  return { projectId, clientEmail, privateKey };
}

const base64url = (data: ArrayBuffer | string) =>
  Buffer.from(typeof data === 'string' ? data : new Uint8Array(data)).toString('base64url');

async function importKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/^"|"$/g, '')
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  return crypto.subtle.importKey(
    'pkcs8',
    new Uint8Array(Buffer.from(body, 'base64')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

// Cached on globalThis so dev hot reloads and warm Worker isolates reuse the token.
const cache = globalThis as typeof globalThis & {
  __firestoreToken?: { value: string; expiresAt: number };
};

async function accessToken({ clientEmail, privateKey }: Credentials): Promise<string> {
  const cached = cache.__firestoreToken;
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.value;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const unsigned = `${header}.${claims}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    await importKey(privateKey),
    new TextEncoder().encode(unsigned),
  );

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${base64url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`Firestore auth failed: ${res.status} ${await res.text()}`);
  const { access_token, expires_in } = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cache.__firestoreToken = { value: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

// ─── Value encoding ───────────────────────────────────────────────────────────

type Value = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

function encodeValue(v: unknown): Value {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number')
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (v instanceof Uint8Array) return { bytesValue: Buffer.from(v).toString('base64') };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (isPlainObject(v)) return { mapValue: { fields: encodeFields(v) } };
  throw new Error(`Unsupported Firestore value: ${String(v)}`);
}

function encodeFields(data: Record<string, unknown>): Record<string, Value> {
  const fields: Record<string, Value> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && !(value instanceof Sentinel)) fields[key] = encodeValue(value);
  }
  return fields;
}

function decodeValue(v: Value): unknown {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return new Date(v.timestampValue as string);
  if ('bytesValue' in v) return Buffer.from(v.bytesValue as string, 'base64');
  if ('referenceValue' in v) return v.referenceValue;
  if ('geoPointValue' in v) return v.geoPointValue;
  if ('arrayValue' in v) {
    const values = (v.arrayValue as { values?: Value[] }).values ?? [];
    return values.map(decodeValue);
  }
  if ('mapValue' in v)
    return decodeFields((v.mapValue as { fields?: Record<string, Value> }).fields);
  return null;
}

function decodeFields(fields: Record<string, Value> | undefined): DocumentData {
  const data: DocumentData = {};
  for (const [key, value] of Object.entries(fields ?? {})) data[key] = decodeValue(value);
  return data;
}

// ─── Field paths and writes ───────────────────────────────────────────────────

const quoteSegment = (s: string) =>
  /^[A-Za-z_][A-Za-z_0-9]*$/.test(s) ? s : `\`${s.replace(/[`\\]/g, '\\$&')}\``;
const fieldPath = (segments: string[]) => segments.map(quoteSegment).join('.');

/** Puts `value` at `segments` inside a nested object. */
function setDeep(target: Record<string, unknown>, segments: string[], value: unknown) {
  let node = target;
  for (const segment of segments.slice(0, -1)) {
    if (!isPlainObject(node[segment])) node[segment] = {};
    node = node[segment] as Record<string, unknown>;
  }
  node[segments[segments.length - 1]] = value;
}

interface Entry {
  path: string[];
  value: unknown;
}

/** Leaf entries of an object for a merge (maps are merged key by key, like the Admin SDK). */
function leaves(data: Record<string, unknown>, prefix: string[] = []): Entry[] {
  return Object.entries(data).flatMap(([key, value]) =>
    isPlainObject(value) && Object.keys(value).length
      ? leaves(value, [...prefix, key])
      : [{ path: [...prefix, key], value }],
  );
}

/**
 * A Firestore `Write` that updates only the given paths: plain values are set, delete() removes
 * the field, serverTimestamp() becomes a transform.
 */
function buildWrite(name: string, entries: Entry[], mustExist: boolean) {
  const body: Record<string, unknown> = {};
  const mask: string[] = [];
  const transforms: { fieldPath: string; setToServerValue: 'REQUEST_TIME' }[] = [];
  for (const { path, value } of entries) {
    if (value === undefined) continue;
    if (value instanceof Sentinel && value.kind === 'serverTimestamp') {
      transforms.push({ fieldPath: fieldPath(path), setToServerValue: 'REQUEST_TIME' });
      continue;
    }
    mask.push(fieldPath(path));
    if (!(value instanceof Sentinel)) setDeep(body, path, value);
  }
  return {
    update: { name, fields: encodeFields(body) },
    updateMask: { fieldPaths: mask },
    ...(transforms.length ? { updateTransforms: transforms } : {}),
    ...(mustExist ? { currentDocument: { exists: true } } : {}),
  };
}

const updateEntries = (data: DocumentData): Entry[] =>
  Object.entries(data).map(([key, value]) => ({ path: key.split('.'), value }));

// ─── Snapshots, references and queries ────────────────────────────────────────

export class DocumentSnapshot {
  constructor(
    readonly id: string,
    private readonly fields: DocumentData | undefined,
  ) {}
  get exists(): boolean {
    return this.fields !== undefined;
  }
  data(): DocumentData | undefined {
    return this.fields;
  }
}

export interface QuerySnapshot {
  docs: DocumentSnapshot[];
  empty: boolean;
}

interface RawDocument {
  name: string;
  fields?: Record<string, Value>;
}

const idOf = (name: string) => name.slice(name.lastIndexOf('/') + 1);

class Firestore {
  private readonly creds = credentials();
  readonly root = `projects/${this.creds.projectId}/databases/(default)/documents`;
  private readonly api = `https://firestore.googleapis.com/v1/${this.root}`;

  collection(name: string) {
    return new CollectionReference(this, name);
  }

  async request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const res = await fetch(`${this.api}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${await accessToken(this.creds)}`,
        'Content-Type': 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!res.ok) {
      const error = new Error(`Firestore ${init.method ?? 'GET'} ${path}: ${res.status}`);
      (error as Error & { status?: number; detail?: string }).status = res.status;
      (error as Error & { detail?: string }).detail = await res.text();
      throw error;
    }
    return (await res.json()) as T;
  }

  async getDoc(ref: DocumentReference, transaction?: string): Promise<DocumentSnapshot> {
    const res = await this.request<{ found?: RawDocument; missing?: string }[]>(':batchGet', {
      method: 'POST',
      body: { documents: [ref.name], ...(transaction ? { transaction } : {}) },
    });
    const found = res.find((r) => r.found)?.found;
    return new DocumentSnapshot(ref.id, found ? decodeFields(found.fields ?? {}) : undefined);
  }

  async runQuery(query: Query, transaction?: string): Promise<QuerySnapshot> {
    const res = await this.request<{ document?: RawDocument }[]>(':runQuery', {
      method: 'POST',
      body: { structuredQuery: query.toJSON(), ...(transaction ? { transaction } : {}) },
    });
    const docs = res
      .filter((r) => r.document)
      .map((r) => new DocumentSnapshot(idOf(r.document!.name), decodeFields(r.document!.fields)));
    return { docs, empty: docs.length === 0 };
  }

  async commit(writes: unknown[], transaction?: string): Promise<void> {
    await this.request(':commit', {
      method: 'POST',
      body: { writes, ...(transaction ? { transaction } : {}) },
    });
  }

  /**
   * Reads inside `fn` see a consistent snapshot and its writes are committed atomically. On a
   * contention error (ABORTED, 409) the whole function is retried, like the Admin SDK.
   */
  async runTransaction<T>(fn: (tx: Transaction) => Promise<T>, attempts = 5): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      const { transaction } = await this.request<{ transaction: string }>(':beginTransaction', {
        method: 'POST',
        body: {},
      });
      const tx = new Transaction(this, transaction);
      try {
        const result = await fn(tx);
        await this.commit(tx.writes, transaction);
        return result;
      } catch (error) {
        const status = (error as { status?: number }).status;
        if (status !== 409 || attempt >= attempts) {
          await this.request(':rollback', { method: 'POST', body: { transaction } }).catch(
            () => {},
          );
          throw error;
        }
      }
    }
  }
}

export class DocumentReference {
  constructor(
    private readonly db: Firestore,
    readonly collection: string,
    readonly id: string,
  ) {}
  get name(): string {
    return `${this.db.root}/${this.collection}/${this.id}`;
  }
  get(): Promise<DocumentSnapshot> {
    return this.db.getDoc(this);
  }
  /** Updates fields (dotted keys are paths). Fails if the document doesn't exist. */
  update(data: DocumentData): Promise<void> {
    return this.db.commit([buildWrite(this.name, updateEntries(data), true)]);
  }
  /** With `merge`, writes only the given fields (maps merged deeply); otherwise replaces the doc. */
  set(data: DocumentData, options?: { merge?: boolean }): Promise<void> {
    return this.db.commit([setWrite(this.name, data, options?.merge === true)]);
  }
}

function setWrite(name: string, data: DocumentData, merge: boolean) {
  const write = buildWrite(name, leaves(data), false);
  // Without a mask Firestore replaces the whole document.
  return merge ? write : { ...write, updateMask: undefined };
}

class Query {
  constructor(
    protected readonly db: Firestore,
    readonly collection: string,
    private readonly filters: { field: string; value: unknown }[] = [],
    private readonly max?: number,
  ) {}
  where(field: string, op: '==', value: unknown): Query {
    return new Query(this.db, this.collection, [...this.filters, { field, value }], this.max);
  }
  limit(n: number): Query {
    return new Query(this.db, this.collection, this.filters, n);
  }
  get(): Promise<QuerySnapshot> {
    return this.db.runQuery(this);
  }
  toJSON() {
    const filters = this.filters.map(({ field, value }) => ({
      fieldFilter: {
        field: { fieldPath: fieldPath(field.split('.')) },
        op: 'EQUAL',
        value: encodeValue(value),
      },
    }));
    return {
      from: [{ collectionId: this.collection }],
      ...(filters.length === 1
        ? { where: filters[0] }
        : filters.length > 1
          ? { where: { compositeFilter: { op: 'AND', filters } } }
          : {}),
      ...(this.max ? { limit: this.max } : {}),
    };
  }
}

class CollectionReference extends Query {
  constructor(db: Firestore, collection: string) {
    super(db, collection);
  }
  doc(id: string): DocumentReference {
    return new DocumentReference(this.db, this.collection, id);
  }
}

class Transaction {
  readonly writes: unknown[] = [];
  constructor(
    private readonly db: Firestore,
    private readonly id: string,
  ) {}
  get(ref: DocumentReference): Promise<DocumentSnapshot>;
  get(query: Query): Promise<QuerySnapshot>;
  get(target: DocumentReference | Query): Promise<DocumentSnapshot | QuerySnapshot> {
    return target instanceof DocumentReference
      ? this.db.getDoc(target, this.id)
      : this.db.runQuery(target, this.id);
  }
  set(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }): this {
    this.writes.push(setWrite(ref.name, data, options?.merge === true));
    return this;
  }
  update(ref: DocumentReference, data: DocumentData): this {
    this.writes.push(buildWrite(ref.name, updateEntries(data), true));
    return this;
  }
}

// ─── Entry points ─────────────────────────────────────────────────────────────

const instance = globalThis as typeof globalThis & { __firestore?: Firestore };

export function getAdminDb(): Firestore {
  return (instance.__firestore ??= new Firestore());
}

/** Collection name for the current environment: `users` in production, `users-uat` elsewhere. */
export function envCollection(name: string): string {
  return process.env.APP_ENV === 'production' ? name : `${name}-uat`;
}

/**
 * A date field as a Date, or null. Accepts Firestore timestamps (what this app writes) and ISO
 * strings (what other 4HOPE apps sharing the users collection write, e.g. `createdAt`).
 */
export function timestampToDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}
