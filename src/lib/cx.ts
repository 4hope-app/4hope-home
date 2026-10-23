/** Joins class names, skipping falsy values: cx('btn', active && 'btn--on'). */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
