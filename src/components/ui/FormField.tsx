/** Server/client version of the design system FormField: label + hint or error around a control. */
import type { ReactNode } from 'react';
import styles from './FormField.module.css';

interface Props {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** id for the hint/error line, to reference from the control's aria-describedby. */
  messageId?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  messageId,
  children,
}: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <span className={styles.error} id={messageId} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint} id={messageId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
