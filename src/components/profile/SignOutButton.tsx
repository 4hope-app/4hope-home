'use client';

import type { ReactNode } from 'react';
import { signOut } from 'next-auth/react';

interface Props {
  label: string;
  callbackUrl: string;
  className?: string;
  /** The icon, rendered on the server (Icon can't be imported here). */
  children: ReactNode;
}

/** Icon button that signs out and goes back to the sign-in page. */
export default function SignOutButton({ label, callbackUrl, className, children }: Props) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      onClick={() => signOut({ callbackUrl })}
    >
      {children}
    </button>
  );
}
