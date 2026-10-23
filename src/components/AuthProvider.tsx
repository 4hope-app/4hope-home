'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

/** Makes `useSession()` available to client components (header account menu, auth forms). */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
