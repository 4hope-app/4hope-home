import type { ReactNode } from 'react';
import Document from '@/components/layout/Document';
export { viewport } from '@/lib/viewport';

/** Root layout for the Spanish pages (default locale, no URL prefix): <html lang="es-419">. */
export default function SpanishLayout({ children }: { children: ReactNode }) {
  return <Document lang="es">{children}</Document>;
}
