/**
 * Server version of the design system Button (components/Button).
 * primary = gold fill with ink text; subtle = outline; neutral = ink fill.
 * Renders an <a> when `href` is set, otherwise a <button>.
 */
import type { ReactNode } from 'react';
import Icon from './Icon';
import { buttonClass } from './buttonClass';

interface Props {
  href?: string;
  variant?: 'primary' | 'neutral' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: string;
  iconRight?: string;
  external?: boolean;
  full?: boolean;
  className?: string;
  children?: ReactNode;
  [key: `data-${string}`]: string | undefined;
}

export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  external = false,
  full = false,
  className,
  children,
  ...rest
}: Props) {
  const iconSize = { sm: 16, md: 18, lg: 20 }[size];
  const classes = buttonClass({ variant, size, full }, className);
  const content = (
    <>
      {iconLeft && <Icon name={iconLeft} size={iconSize} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  );

  return href ? (
    <a
      className={classes}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      {...rest}
    >
      {content}
    </a>
  ) : (
    <button className={classes} type="button" {...rest}>
      {content}
    </button>
  );
}
