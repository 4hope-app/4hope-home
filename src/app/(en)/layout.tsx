import type { ReactNode } from 'react';
import Document from '@/components/layout/Document';
export { viewport } from '@/lib/viewport';

/** Root layout for the English pages under /en: <html lang="en">. */
export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <Document lang="en">{children}</Document>;
}
