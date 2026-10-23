import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores([
    '.next/',
    '.open-next/',
    '.wrangler/',
    'node_modules/',
    'public/design-system/',
    'next-env.d.ts',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Logos and marks are fixed-size SVG/PNG files served as-is; next/image adds nothing here.
      '@next/next/no-img-element': 'off',
      // es and en are separate root layouts, so moving between them is a full page load anyway;
      // plain <a> keeps the markup identical to the design system pages.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]);
