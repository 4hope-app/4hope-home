/**
 * Server-rendered version of the design system's Icon component.
 * Reads the same Feather data as components/bundle.js at render time — nothing ships to the client.
 * Paints with currentColor: set `color` on a parent.
 */
// Plain JS data module copied from the design system (assets/icons/icon-data.js).
import { icons } from '../../../design-system/icon-data.js';
import { cx } from '@/lib/cx';

interface Props {
  name: string;
  size?: number;
  label?: string;
  className?: string;
}

const FIGMA_BBOX =
  '<path d="M 0 0 L 16 0 L 16 16 L 0 16 L 0 0 Z" fill="currentColor" fill-rule="nonzero"/>';

export default function Icon({ name, size = 20, label, className }: Props) {
  const data = (icons as Record<string, { viewBox: string; body: string } | undefined>)[name];
  if (!data) throw new Error(`Icon "${name}" is not in the 4Hope design system icon set.`);
  const body = data.body.replace(FIGMA_BBOX, '');

  return (
    <svg
      className={cx('icon', className)}
      width={size}
      height={size}
      viewBox={data.viewBox}
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
