# 4hope-home

Official landing page of **4HOPE** ([4hope.app](https://4hope.app)) — free tools for the LATAM Teamfight Tactics community.

The site presents the project and its tools (the first one, [TFT Competition Bracket](https://bracket.4hope.app), lives on its own subdomain), the competitive team, the community and contact channels. It is Spanish by default (`/`, `es-419`) with an English version (`/en`), and supports Google sign-in with a player profile.

## Features

- **Landing** — hero, what 4HOPE is, tools (live and coming soon), competitive team, community, FAQ, contact and a final call to action.
- **Bilingual** — Spanish at `/`, English at `/en`, with canonical + `hreflang` tags, a sitemap and JSON-LD (`Organization`, `FAQPage`).
- **Accounts** — Google sign-in (`/login`), first-time onboarding to pick a player name (`/register`) and a profile page (`/profile`). Profiles are stored in Firestore.
- **Design system** — built on the [4Hope Design System](https://claude.ai/artifact/JXsqpsgG8iNkLF6XFMqSF2) (Arena theme): ink black, one gold accent, Archivo / Inter / Roboto Mono.
- **Fast by default** — pages are server-rendered and prerendered; only a few small client components ship JavaScript. Self-hosted fonts, cookie-free analytics (optional).

## Tech stack

| Area      | Choice                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React Server Components, Turbopack) + React 19                     |
| Language  | TypeScript (strict)                                                                                              |
| Styling   | CSS Modules + global CSS; design tokens generated from `design-system/tokens.json` into `src/styles/tokens.css`  |
| Auth      | [Auth.js](https://authjs.dev) v5 (`next-auth@beta`), Google provider, JWT sessions                               |
| Data      | Firebase Admin (Firestore), server only                                                                          |
| Hosting   | Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) (`next start` on any Node host also works) |
| Tooling   | ESLint (`eslint-config-next`), Prettier                                                                          |
| Analytics | Plausible or Umami (optional, cookie-free)                                                                       |

## Getting started

### Requirements

- **Node 22.6+** (see `.nvmrc`; the token script runs TypeScript with `--experimental-strip-types`)
- **npm 10+**

### Install and run

```bash
nvm use                      # Node 22
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

The landing pages work without any environment variables. Sign-in needs the Auth.js and Google values, and profiles need the Firebase ones.

### Environment variables

All of them are listed with comments in [`.env.example`](./.env.example).

| Variable                                                               | Needed for             | Notes                                                               |
| ---------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `AUTH_SECRET`                                                          | Sessions               | Generate with `npx auth secret`                                     |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                                 | Google sign-in         | OAuth client (Web application) in Google Cloud Console              |
| `AUTH_TRUST_HOST`                                                      | Sign-in outside Vercel | `true` on Cloudflare and `next start`                               |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Profiles (Firestore)   | From a Firebase service-account JSON; the key on one line with `\n` |
| `APP_ENV`                                                              | Firestore collections  | `production` uses `users`; anything else uses `users-uat`           |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_UMAMI_*`                | Analytics (optional)   | Read at build time; nothing loads when empty                        |

Secrets never use the `NEXT_PUBLIC_` prefix.

**Google OAuth:** in Google Cloud Console → APIs & Services → Credentials, create an OAuth client ID of type _Web application_ and add the authorized redirect URIs `http://localhost:3000/api/auth/callback/google` and `https://4hope.app/api/auth/callback/google`.

**Firebase:** enable Firestore, then Project settings → Service accounts → _Generate new private key_, and copy the three values from that JSON.

### Scripts

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Regenerates `tokens.css`, starts the dev server on :3000             |
| `npm run build`      | Tokens + type check + production build                               |
| `npm run start`      | Serves the production build (Node)                                   |
| `npm run check`      | TypeScript only                                                      |
| `npm run lint`       | ESLint                                                               |
| `npm run format`     | Prettier (write); `npm run format:check` to only check               |
| `npm run tokens`     | Regenerates `src/styles/tokens.css` from `design-system/tokens.json` |
| `npm run cf:preview` | Builds for Cloudflare and runs it locally in workerd (:8787)         |
| `npm run cf:deploy`  | Builds for Cloudflare and deploys with Wrangler                      |

## Project structure

```
src/
  app/
    (es)/                 Spanish root layout (<html lang="es-419">): /, /privacy, /login, /register, /profile
    (en)/en/              English root layout (<html lang="en">): /en, /en/privacy, /en/login
    api/auth/[...nextauth]/   Auth.js handlers
    api/profile/me/       Profile API (GET / POST / PATCH)
    global-not-found.tsx  404 for every unmatched URL
    sitemap.ts            /sitemap.xml
  components/
    layout/               Document (<html> shell), Header, Footer, AccountMenu, LanguageSwitcher, ScrollSpy
    sections/             Landing sections (Hero, WhatIs, Tools, Teams, Community, Faq, Contact, FinalCta)
    pages/                Page bodies shared by both languages (Home, Privacy, Login, NotFound)
    auth/                 Sign-in screens (AuthShell, LoginForm, GoogleG, LegalNote)
    islands/              Client components (FaqAccordion, MobileMenu, CopyEmail) + design-system loader
    ui/                   Design-system components (Button, Card, Tag, Badge, Icon, Input, FormField, …)
  data/                   tools.ts, links.ts, navigation.ts
  i18n/                   es.json, en.json (all copy), utils.ts
  lib/                    auth, firebaseAdmin, session/profile guards, SEO helpers
  styles/                 tokens.css (generated), fonts.css, global.css, islands.css
design-system/            tokens.json, icon-data.js, index.d.ts (copies from the design system)
public/                   fonts, brand assets, icons, OG images, design-system bundle, _headers
scripts/build-tokens.ts   tokens.json → src/styles/tokens.css
```

Contributor and architecture notes (conventions, gotchas, how to refresh the design system) are in [`CLAUDE.md`](./CLAUDE.md).

## Branches

| Branch      | Purpose                                                   |
| ----------- | --------------------------------------------------------- |
| `main`      | Production. What is deployed to 4hope.app                 |
| `dev`       | Integration branch. Features are merged here first        |
| `feature/*` | New work, e.g. `feature/login-google`. Branch off `dev`   |
| `fix/*`     | Bug fixes, e.g. `fix/mobile-menu-focus`. Branch off `dev` |

**Workflow:** branch from `dev` → open a PR into `dev` → when `dev` is ready to ship, open a PR from `dev` into `main`. Don't push directly to `main`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `feat: …`, `fix: …`, `chore: …`, `docs: …`, `refactor: …`.

## Deploy (Cloudflare Workers)

1. `npx wrangler login` once, then `npm run cf:deploy` — or connect the repo in Cloudflare _Workers & Pages → Import a repository_ with build command `npx opennextjs-cloudflare build` and deploy command `npx wrangler deploy`.
2. Add the server secrets with `npx wrangler secret put <NAME>` (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `FIREBASE_*`) and set `AUTH_TRUST_HOST=true` and `APP_ENV=production`. For `cf:preview`, put the same values in `.dev.vars`.
3. Analytics variables are **build** variables (read when pages are prerendered).
4. _Settings → Domains & Routes_ → add `4hope.app` and `www.4hope.app` (redirect to the apex). Tools keep their own subdomains (`bracket.4hope.app` is a separate project).

## Launch checklist

- [ ] **DNS** — point `4hope.app` (and `www`) to the Cloudflare Worker.
- [ ] **Auth** — create the Google OAuth client and the Firebase service account; set the secrets in Cloudflare.
- [ ] **Terms page** — `/terms` doesn't exist yet; the sign-in and onboarding screens link to it.
- [ ] **Discord** — replace `https://discord.gg/TODO-4hope-invite` in `src/data/links.ts`.
- [ ] **Socials** — set the X, Instagram and Twitch URLs in `src/data/links.ts` and set `ready: true`.
- [ ] **Contact email** — create the `hola@4hope.app` mailbox (or change `links.email`).
- [ ] **OG images** — replace the placeholders `public/og/og-es.png` and `og-en.png` (1200×630).
- [ ] **TT Bluescreens license** — the hero wordmark uses a trial font; confirm a web license.
- [ ] **Privacy page** — review the text and set the real date in `src/components/pages/PrivacyPage.tsx`.
- [ ] **Analytics** — create the site in Plausible or Umami and set the variables.
- [ ] **Search Console** — submit `https://4hope.app/sitemap.xml`.

Search the code for `TODO:` to find every open item.
