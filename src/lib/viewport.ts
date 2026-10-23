import type { Viewport } from 'next';

/** Shared by both root layouts and the global 404. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0c0c0d',
  colorScheme: 'dark',
};
