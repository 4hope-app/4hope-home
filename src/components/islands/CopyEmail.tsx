'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  email: string;
  label: string;
  copiedLabel: string;
  icon: ReactNode;
  className?: string;
}

/**
 * Copies the contact address to the clipboard. The icon comes from the server Icon so the
 * icon data never ships to the client. The label swaps to `copiedLabel` for 2s (announced
 * through aria-live).
 */
export default function CopyEmail({ email, label, copiedLabel, icon, className }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = () => {
    navigator.clipboard
      .writeText(email)
      .then(() => setCopied(true))
      .catch((err: unknown) => console.error(err));
  };

  return (
    <button type="button" className={className} onClick={copy}>
      {icon}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
