/**
 * Loads the 4Hope Design System bundle (public/design-system/bundle.js) for client components.
 *
 * The bundle is a classic script that reads `window.React` and assigns
 * `window.Ds4HopeDesignSystem_bf19a7`. Client components hand it the SAME React instance Next
 * hydrates them with, so hooks inside design-system components run on one React copy (the
 * bundle only uses createElement, Fragment and hooks, which React 19 keeps). The bundle (and
 * bundle.css, which aliases --family-* for the components) is loaded once, on first use, and
 * never server-rendered — static pages don't need either.
 */
import React from 'react';
import type { ComponentType, ReactNode, RefObject } from 'react';

/* Minimal prop types for the components the landing uses (full types: design-system/index.d.ts). */
export interface DesignSystem {
  Icon: ComponentType<{ name: string; size?: number; 'aria-hidden'?: boolean }>;
  IconButton: ComponentType<{
    icon: ReactNode;
    variant?: 'primary' | 'neutral' | 'subtle' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    'aria-label': string;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
  }>;
  MenuItem: ComponentType<{
    icon?: ReactNode;
    active?: boolean;
    onClick?: () => void;
    children?: ReactNode;
  }>;
  Accordion: ComponentType<{
    items: { title: ReactNode; content: ReactNode }[];
    allowMultiple?: boolean;
  }>;
}

const GLOBAL = 'Ds4HopeDesignSystem_bf19a7';
const SRC = '/design-system/bundle.js';
const CSS = '/design-system/bundle.css';

type DsWindow = Window & { React?: typeof React; [GLOBAL]?: DesignSystem };

let pending: Promise<DesignSystem> | null = null;

export function loadDesignSystem(): Promise<DesignSystem> {
  const w = window as DsWindow;
  const ready = w[GLOBAL];
  if (ready) return Promise.resolve(ready);
  if (pending) return pending;
  w.React ??= React;
  if (!document.querySelector(`link[href="${CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS;
    document.head.appendChild(link);
  }
  pending = new Promise<DesignSystem>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.onload = () => {
      const ds = w[GLOBAL];
      if (ds) resolve(ds);
      else reject(new Error('Design system bundle loaded without exporting its namespace.'));
    };
    script.onerror = () => {
      pending = null;
      reject(new Error(`Could not load ${SRC}`));
    };
    document.head.appendChild(script);
  });
  return pending;
}

/** React hook: true once `ref`'s element has entered the viewport (stays true). */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, inView]);
  return inView;
}

/**
 * React hook: the design system once loaded, `null` before (render a static fallback meanwhile).
 * Nothing is fetched until `enabled` is true — pass `useInView(ref)` to load it on scroll.
 */
export function useDesignSystem(enabled = true): DesignSystem | null {
  const [ds, setDs] = React.useState<DesignSystem | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadDesignSystem()
      .then((loaded) => alive && setDs(loaded))
      .catch((err: unknown) => console.error(err));
    return () => {
      alive = false;
    };
  }, [enabled]);
  return ds;
}
