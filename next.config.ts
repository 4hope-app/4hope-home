import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

/** Security headers for every server response (static assets get theirs from public/_headers). */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A package-lock.json in a parent folder would otherwise be taken as the workspace root.
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  // es and en are separate root layouts (each sets <html lang>), so unmatched URLs need
  // app/global-not-found.tsx, which is still behind this flag.
  experimental: { globalNotFound: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
