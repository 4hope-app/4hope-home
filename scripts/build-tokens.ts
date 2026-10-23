/**
 * build-tokens.ts — design-system/tokens.json -> src/styles/tokens.css
 *
 * Mirrors the 4Hope Design System's compiled layout:
 *   :root, [data-theme="<first>"] { colors + shadows (first theme) }
 *   [data-theme="<id>"]           { per-theme overrides }
 *   :root                          { spacing, radius, other families, --font-<family> }
 *   .<style>                       { one class per type style }
 *   @font-face                     { fonts from tokens.json whose file exists in public/fonts }
 *
 * Run: npm run tokens  (Node >= 22.6, uses --experimental-strip-types)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type ThemedValue = string | Record<string, string>;
interface Token {
  name: string;
  value: ThemedValue;
  usage?: string;
}
interface TypeStyle {
  name: string;
  family?: string;
  fontSize: string;
  lineHeight?: number | string;
  fontWeight?: number | string;
  letterSpacing?: string;
  fontStyle?: string;
}
interface Tokens {
  name: string;
  color: { themes: { id: string; name: string }[]; tokens: Token[] };
  type: {
    fonts: { family: string; file: string; weight: string; style?: string }[];
    families: Record<string, string>;
    groups: { name: string; family: string; styles: TypeStyle[] }[];
  };
  [family: string]: unknown;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'design-system/tokens.json');
const out = resolve(root, 'src/styles/tokens.css');
const tokens = JSON.parse(readFileSync(src, 'utf8')) as Tokens;

const ident = (name: string): string => name.replace(/^[-.]+/, '').replace(/\./g, '\\.');
const value = (v: string): string => {
  const alias = /^\{(.+)\}$/.exec(v);
  return alias ? `var(--${ident(alias[1] ?? '')})` : v;
};
const decl = (name: string, v: string): string => `  --${ident(name)}: ${value(v)};`;

const themes = tokens.color.themes.map((t) => t.id);
const first = themes[0] ?? 'light';
const byTheme = new Map<string, string[]>(themes.map((t) => [t, []]));

const themed = (list: Token[]): void => {
  for (const t of list) {
    if (typeof t.value === 'string') {
      byTheme.get(first)?.push(decl(t.name, t.value));
      continue;
    }
    const firstValue = t.value[first] ?? Object.values(t.value)[0];
    if (firstValue) byTheme.get(first)?.push(decl(t.name, firstValue));
    for (const id of themes.slice(1)) {
      const v = t.value[id];
      if (v !== undefined) byTheme.get(id)?.push(decl(t.name, v));
    }
  }
};
themed(tokens.color.tokens);

const shadow = tokens['shadow'] as { tokens: Token[] } | undefined;
if (shadow) themed(shadow.tokens);

const plain: string[] = [];
for (const [family, data] of Object.entries(tokens)) {
  if (['name', 'version', 'color', 'type', 'shadow', 'meta'].includes(family)) continue;
  const list = (data as { tokens?: Token[] } | undefined)?.tokens;
  if (!Array.isArray(list)) continue;
  for (const t of list) if (typeof t.value === 'string') plain.push(decl(t.name, t.value));
}
for (const [key, stack] of Object.entries(tokens.type.families)) {
  plain.push(`  --font-${ident(key)}: ${stack};`);
}

const len = (v: number | string | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? String(v) : v;
const classes: string[] = [];
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const rules = [
      `font-family: var(--font-${ident(s.family ?? group.family)})`,
      `font-size: ${s.fontSize}`,
      s.lineHeight !== undefined ? `line-height: ${len(s.lineHeight)}` : '',
      s.fontWeight !== undefined ? `font-weight: ${s.fontWeight}` : '',
      s.letterSpacing ? `letter-spacing: ${s.letterSpacing}` : '',
      s.fontStyle ? `font-style: ${s.fontStyle}` : '',
    ].filter(Boolean);
    classes.push(`.${ident(s.name)} {\n  ${rules.join(';\n  ')};\n}`);
  }
}

const faces: string[] = [];
const skipped: string[] = [];
for (const f of tokens.type.fonts) {
  const file = basename(f.file);
  if (!existsSync(resolve(root, 'public/fonts', file))) {
    skipped.push(file);
    continue;
  }
  // Prefer a same-named .woff2 next to the file (smaller, same glyphs); keep the original as fallback.
  const woff2 = file.replace(/\.(ttf|otf|woff)$/i, '.woff2');
  const fmt = file.endsWith('.otf') ? 'opentype' : file.endsWith('.woff') ? 'woff' : 'truetype';
  const srcs = [
    ...(woff2 !== file && existsSync(resolve(root, 'public/fonts', woff2))
      ? [`url("/fonts/${woff2}") format("woff2")`]
      : []),
    `url("/fonts/${file}") format("${fmt}")`,
  ].join(', ');
  faces.push(
    `@font-face {\n  font-family: "${f.family}";\n  src: ${srcs};\n  font-weight: ${f.weight};\n  font-style: ${f.style ?? 'normal'};\n  font-display: swap;\n}`,
  );
}

const css =
  [
    `/* ${tokens.name} Design System — generated from tokens.json */`,
    '/* Do not edit by hand. Update design-system/tokens.json and run `npm run tokens`. */',
    ...faces,
    `:root,\n[data-theme="${first}"] {\n${(byTheme.get(first) ?? []).join('\n')}\n}`,
    ...themes
      .slice(1)
      .map((id) => `[data-theme="${id}"] {\n${(byTheme.get(id) ?? []).join('\n')}\n}`),
    `:root {\n${plain.join('\n')}\n}`,
    ...classes,
  ]
    .filter((block) => block !== '')
    .join('\n\n') + '\n';

writeFileSync(out, css);
const count = [...byTheme.values()].reduce((n, l) => n + l.length, 0) + plain.length;
console.log(
  `tokens.css: ${count} declarations, ${classes.length} type styles, ${faces.length} font faces`,
);
if (skipped.length > 0) {
  console.log(
    `  not self-hosted here (not in public/fonts): ${[...new Set(skipped)].length} font files`,
  );
}
