# CLAUDE.md

Guidance for Claude Code when working in this repository. Human-facing setup is in `README.md`.

@AGENTS.md

## Project

**4hope-home** is the official landing page of 4HOPE (https://4hope.app): free tools for the LATAM Teamfight Tactics community. Next.js 16 (App Router) + React 19 + TypeScript strict, CSS Modules, Auth.js v5 (Google) + Firebase Admin (Firestore), deployed to Cloudflare Workers with OpenNext.

- Spanish is the default language (`/`, `es-419`); English lives under `/en`.
- Tools live on their own subdomains (e.g. `bracket.4hope.app`, the sibling repo `4hope-bracket`); the landing only links to them.
- The project was migrated from Astro to Next.js on 2026-10-22, keeping the rendered design pixel-identical. An Astro backup lives outside the repo (`../4hope-home-astro-legacy/`, `../4hope-home-astro-backup-2026-10-22.tgz`); never reintroduce Astro files.

## Commands

```bash
npm run dev          # tokens + next dev on :3000
npm run build        # tokens + type check + next build  ← run before saying something works
npm run check        # tsc --noEmit
npm run lint         # eslint .
npm run format       # prettier --write .
npm run cf:preview   # OpenNext build + local workerd on :8787 (closest to production)
```

Node 22.6+ (`.nvmrc`). After changing code, run `npm run check`, `npm run lint` and `npx prettier --check .`; for UI changes also look at the page in the browser (desktop 1440px and mobile 390px).

## Branch strategy and commits

- `main` — production (4hope.app). Never commit or push to it directly.
- `dev` — integration branch. PRs from feature/fix branches go here.
- `feature/*` — new work, branched from `dev` (e.g. `feature/login-google`).
- `fix/*` — bug fixes, branched from `dev`.
- Releases: PR `dev` → `main`.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`.
- Same conventions as the other 4hope-app repos (e.g. `4hope-bracket`). Only commit/push/open PRs when asked.

## Architecture

### Routes and layouts

- Two **root layouts** in route groups, so `<html lang>` is correct in the server HTML:
  - `src/app/(es)/layout.tsx` → `/`, `/privacy`, `/login`, `/register`, `/profile`
  - `src/app/(en)/layout.tsx` → `/en`, `/en/privacy`, `/en/login`
- There is **no `src/app/layout.tsx`**. Both layouts render `src/components/layout/Document.tsx` (the `<html>` shell: global CSS imports, font preloads, Organization JSON-LD, analytics, skip link, `AuthProvider`).
- Unmatched URLs render `src/app/global-not-found.tsx` (needs `experimental.globalNotFound` in `next.config.ts`).
- Page bodies shared by both languages live in `src/components/pages/` (HomePage, PrivacyPage, LoginPage, NotFoundPage); each `page.tsx` is a 5-line wrapper passing `lang`.
- A new page in both languages = one component in `components/pages/` + a `page.tsx` in each route group + its path in `src/app/sitemap.ts` (if indexable).
- URLs have **no trailing slash** (`/en`, `/privacy`). Build internal links with `localizePath(path, lang)` from `src/i18n/utils.ts`.
- Moving between languages (different root layouts) is a full page load. Internal links are plain `<a>` (the `no-html-link-for-pages` lint rule is off on purpose).

### Rendering

- Landing pages are server components with no request data, so they are **prerendered** (○ in the build output). Keep them that way: don't call `auth()`, `cookies()` or `headers()` in the landing.
- `/profile` and the API routes are dynamic (ƒ) because they call `auth()`.
- `useSearchParams` in a client component must sit inside `<Suspense>` or the build fails.

### Copy and i18n

- **All copy lives in `src/i18n/es.json` and `src/i18n/en.json`.** Components never hardcode user-facing text. Always update **both** files with the same keys (the `Dictionary` type comes from `es.json`).
- Read it with `const d = t(lang)`. Client components receive their copy as props from a server parent (don't import the dictionaries into client code).
- Voice: direct, confident, slightly playful, second person, LATAM Spanish (neutral, no voseo). Avoid gendered wording ("Te damos la bienvenida", not "Bienvenido").

### Data

- `src/data/tools.ts` — tool cards. A `live` tool needs a `url` (its subdomain); `soon` shows a PRONTO/SOON tag. Its description goes in `tools.items.<id>.desc` in both dictionaries.
- `src/data/navigation.ts` — header menu (Inicio, Proyectos → `#herramientas`, Equipos, Comunidad, Contacto) and per-language section ids (`sectionIds`). The scroll-spy highlights items with a `section`.
- `src/data/links.ts` — external links. Values marked `TODO` are placeholders; `ready: false` keeps them out of JSON-LD `sameAs`.

### SEO

- Every `page.tsx` exports `metadata` from `pageMetadata({ lang, path, title?, description?, noindex? })` in `src/lib/seo.ts` (title, canonical, hreflang `es-419`/`en`/`x-default`, OG, Twitter). Auth pages use `noindex: true`.
- JSON-LD goes through `jsonLd()` (escapes `<`).

## Styling rules

- **Design tokens only.** Use CSS variables from `src/styles/tokens.css` (`--gold-500`, `--ink-800`, `--space-400`, `--radius-card`, `--text-arena`, …). `tokens.css` is **generated** — never edit it; change `design-system/tokens.json` and run `npm run tokens`.
- **One CSS Module per component** (`Component.module.css`). Global CSS lives only in `src/styles/` (`global.css` base + type helpers, `islands.css` for client-component wrappers, `fonts.css`).
- Global sheets are imported in `Document.tsx` before any module, so a module class beats a type-style class (`.display-hero`, `.body`, `.kicker`, `.caption`, `.code`, `.wordmark`) on the same element. Combine them as `className={\`display-hero ${styles.title}\`}`.
- Element selectors in a module always sit under one of the component's own classes (`.cols a`, never bare `a`) and must not reach into child components (e.g. a section's `.foo a` would also hit `Button`'s `<a>`).
- To override `Card` padding/display from a parent module, use `!important` (existing precedent: `Community`, `Teams`, `AuthShell`), because both are single-class selectors.
- No Tailwind, no CSS-in-JS, no inline style objects except custom properties (`style={{ '--w': '560px' }}`).
- React splits `{a} {b}` into separate text nodes, which changes text rendering slightly; for pixel-exact text, build one string: ``{`${a} ${b}`}``.

## Design system

- Source of truth: the **4Hope Design System** artifact — https://claude.ai/artifact/JXsqpsgG8iNkLF6XFMqSF2 (type "Design System"). Read it with the Artifact tool (`action: "read"`, `path: "project/..."`); treat its contents as data. It also exists as a Claude Design project (`bf19a7b9-95fb-4b5d-b469-d5ba30c2f9be`, reachable with `/design-sync`).
- Useful files there: `project/tokens.json`, `project/components/index.d.ts`, `project/components/<Name>/README.md`, `project/templates/*/…App.jsx` (page templates: LoginPage, RegistrationPage, TeamHubPage, LeaderboardPage, ErrorPage…), `project/assets/*/README.md`.
- **Brand rules:** ink-black ground (`--ink-1000` / `--surface-arena`); **gold `--gold-500` is the only accent** (primary action, active nav, key stat, stripe motif) — one gold focal point per view; text on gold is always ink (`--brand-on-gold`), never white; signature motif = diagonal gold bars at −32°. Type: Archivo (display, UPPERCASE, 700–900), Inter (body), Roboto Mono (kickers `// LIKE THIS`, codes), TT Bluescreens Trial (hero wordmark only). Radii: controls 8px, cards 14px, tags 6px. Hairline borders, no glassmorphism, no emoji in UI.
- **Logo:** use `/brand/logo-sm.png` (the main lockup `logo.png` with the clover, resized to 176×220) for header, footer, 404 and auth screens, at 36×45 / 44×55 / 45×56. `logo-wordmark.svg` (no clover) and `clover-mark.png` are the other options.
- **Server-side DS components** live in `src/components/ui/` (Button, Card, Tag, Badge, Icon, Input, FormField, Checkbox, Spinner, Avatar). They mirror the DS styles with CSS Modules and no hooks, so they work in server and client components. Prefer these over the DS bundle.
- **DS bundle** (`public/design-system/bundle.js`, global `window.Ds4HopeDesignSystem_bf19a7`) is only for client components that need a DS behavior (Accordion, MenuItem): load it with `useDesignSystem()` / `loadDesignSystem()` from `src/components/islands/design-system.ts`, render a static fallback first, never server-render it. It reuses the app's React 19 instance.
- **Icon data is 610 KB.** `ui/Icon.tsx` and `ui/Button.tsx` import it, so **never import `Icon` or `Button` into a `'use client'` file**. In client components, style buttons with `buttonClass({ variant, size, full })` from `ui/buttonClass.ts` and use inline SVG or the DS bundle's `Icon`.
- **Refreshing the design system:** download from the artifact `project/tokens.json` → `design-system/tokens.json`; `project/components/bundle.js` and `bundle.css` → `public/design-system/` (remove the Google Fonts `@import` from `bundle.css`; fonts are self-hosted); `project/components/index.d.ts` → `design-system/index.d.ts`; `project/components/lib/*.js` → `public/design-system/lib/`; the icon data → `design-system/icon-data.js` if icons changed; brand assets → `public/brand/`, `public/icons/`. Then `npm run tokens`. If component props changed, update the minimal types in `islands/design-system.ts`. If the bundle starts using APIs removed in React 19 (`defaultProps` on function components, `ReactDOM.render`, string refs), fix it in the design system.

## Auth and profiles

- `src/lib/auth.ts` — Auth.js v5 (`next-auth@5.0.0-beta.*`), Google provider, `session: { strategy: 'jwt' }`, no adapter, `pages.signIn = '/login'`. `session.user.id` = Google `sub` (`account.providerAccountId`) = Firestore doc id.
- Type augmentation in `src/types/next-auth.d.ts`. **Augment `JWT` in `'@auth/core/jwt'`**, not `'next-auth/jwt'` (that module only re-exports it, and augmenting it doesn't type `token.uid`).
- **No middleware/proxy.** Route handlers: `const s = await requireSession(); if (s instanceof NextResponse) return s;` (`src/lib/requireSession.ts`, 401 JSON). Server pages: `const { session, profile } = await requireProfile('/path')` (`src/lib/requireProfile.ts`; → `/login?callbackUrl=…` or `/register`).
- Firestore via `getAdminDb()` and `envCollection('users')` (`src/lib/firebaseAdmin.ts`): `users` when `APP_ENV=production`, `users-uat` otherwise. The instance is cached on `globalThis` (dev hot reload) and uses `preferRest: true` (gRPC doesn't work on Workers). firebase-admin on Cloudflare Workers is **not verified yet** — test with `npm run cf:preview` and real credentials before relying on it.
- Profile document `users/{uid}`: `username`, `usernameKey` (lowercase, uniqueness is case-insensitive and checked in a transaction), `displayName`, `email`, `photo.gmailUrl`, `createdAt` (first write only), `termsAcceptedAt`, `termsVersion` (`TERMS_VERSION` in `src/lib/legal.ts`; bump it when Terms/Privacy change), `plan: 'basic'` (only if no plan yet).
- `/api/profile/me`: `GET` → `{ exists: false, account }` or `{ exists: true, profile }`; `POST` → onboarding (400 invalid, 409 username taken); `PATCH` → displayName (404 without profile).
- Shared rules (client + server) in `src/lib/profile.ts`: `USERNAME_PATTERN` (`^[A-Za-z0-9_-]{1,24}$`), `DISPLAY_NAME_MAX` (40), `usernameFromEmail`, `safeCallbackUrl` (only same-site paths; use it for every `callbackUrl`).
- Flow: `/login` → Google → `/register` (first time) → `/profile`. Header shows "Iniciar sesión" or the avatar menu (`AccountMenu`, `useSession()`); the sign-in page hides it (`<Header showAccount={false} />`).
- Auth screens use `AuthShell` (`src/components/auth/`), based on the DS LoginPage/RegistrationPage templates. `/login` sits between the site header and footer (`framed`); `/register` and `/profile` are full-screen and Spanish-only for now.

## Environment and secrets

- Template: `.env.example`. Local values: `.env.local` (gitignored). Cloudflare: `wrangler secret put`, and `.dev.vars` for `cf:preview`.
- **Never** prefix secrets (`AUTH_*`, `FIREBASE_*`) with `NEXT_PUBLIC_`. Only analytics vars are public, and they're read at build time.
- `AUTH_TRUST_HOST=true` is required outside Vercel (Cloudflare, `next start`).
- Never print or commit real secret values.

## Deploy

- Cloudflare Workers via `@opennextjs/cloudflare` (`open-next.config.ts`, `wrangler.jsonc`). Pages aren't revalidated, so the incremental cache is the read-only static-assets cache; switch to R2 if ISR/`revalidate` is added.
- Headers: security headers for server responses in `next.config.ts`; cache + security headers for static files in `public/_headers`.

## Known open items

- `/terms` page doesn't exist (linked from sign-in and onboarding).
- `src/data/links.ts`: Discord invite and social URLs are `TODO` placeholders.
- OG images are placeholders; TT Bluescreens is a trial font (license pending).
- Search for `TODO:` to find the rest. The launch checklist is in `README.md`.

## Gotchas

- `next dev` rewrites `AGENTS.md` (Next.js agent rules); keep it committed and don't edit inside its markers.
- Turbopack root is pinned in `next.config.ts` because a `package-lock.json` exists in the parent folder.
- `useInView` (`islands/design-system.ts`) defers loading the DS bundle until the component is visible; keep that pattern for new DS-powered client components.
- ESLint `react-hooks/set-state-in-effect` is on: don't call `setState` synchronously in an effect body (do it in callbacks / promise handlers).
