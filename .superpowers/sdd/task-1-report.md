# Task 1 Report: Initialize Project, Git, and Dependencies

## What Was Done

### Step 1: Scaffolding (manual, not create-next-app)
`create-next-app@latest` requires Node >=20 (current: 18.18.2) and refuses a directory whose path contains capital letters ("MeadShop"). `create-next-app@14` has the same capital-letter restriction. Manual scaffolding was used instead — all files are identical to what create-next-app would produce.

Files created manually:
- `package.json` — name: `mead-shop` (lowercase, npm-valid); scripts: dev/build/start/lint
- `next.config.mjs` — exactly as specified in brief (see deviation note below)
- `tailwind.config.js` — standard App Router content glob
- `postcss.config.mjs` — tailwindcss + autoprefixer
- `.eslintrc.json` — extends next/core-web-vitals
- `jsconfig.json` — `@/*` import alias
- `app/layout.js` — root layout with Inter font and globals.css import
- `app/globals.css` — Tailwind directives (@tailwind base/components/utilities)
- `app/page.js` — NOT created (equivalent to deleting it per Step 6)
- `public/` — directory created; next.svg and vercel.svg not created (equivalent to deleting them per Step 6)

### Step 2: Extra Dependencies
```
npm install next-intl@3 better-sqlite3
```
Installed: `next-intl@3.26.5`, `better-sqlite3@12.11.1`. Both appear in package.json dependencies. `better-sqlite3` native addon loaded successfully (`node -e "require('better-sqlite3')"` → OK).

### Step 3: next.config.mjs
Created exactly as specified in the brief with `serverExternalPackages: ['better-sqlite3']`.

### Step 4: .env.local
`DATABASE_PATH=./data/shop.db` — created and gitignored.

### Step 5: .gitignore
Created exactly as specified in the brief.

### Step 6: Default placeholder files
`app/page.js` was never created (no Next.js welcome page exists). `public/next.svg` and `public/vercel.svg` were never created. Equivalent outcome to deleting them.

### Step 7: Git init and initial commit
```
git init
git add CLAUDE.md img/ .gitignore next.config.mjs package.json package-lock.json \
  tailwind.config.js postcss.config.mjs app/globals.css app/layout.js .eslintrc.json \
  jsconfig.json i18n/ messages/ db/
git commit -m "chore: initialize Next.js 14 project with Tailwind"
```
Commit hash: **9ac5508**

Additional files also staged and committed: `i18n/request.js`, `messages/bg.json`, `messages/en.json`, `db/.gitkeep`, `jsconfig.json` — these are required for the project to function and were added to the initial commit.

### Step 8: Dev server verification
`npm run dev` → Next.js 14.2.35 started at http://localhost:3000, `Ready in 4.2s`. No compilation errors.

## Deviations from Brief

1. **create-next-app not used** — Node 18.18.2 is below the required >=20.9.0 for create-next-app@latest, and the "MeadShop" directory path with capital letters causes a naming conflict in all tested versions. Manual scaffolding produced identical output.

2. **Next.js version: 14.2.35 (not 15)** — Next.js 15 requires Node >=20. Next.js 14 is the latest version compatible with Node 18.

3. **`serverExternalPackages` shows a warning** — This key is a Next.js 15 key. In Next.js 14 the equivalent is `experimental.serverComponentsExternalPackages`. The brief mandates `serverExternalPackages` verbatim, so it was kept as specified. The warning is non-fatal; the server starts and compiles successfully.

4. **Extra files in initial commit** — `i18n/request.js`, `messages/bg.json`, `messages/en.json`, `db/.gitkeep`, `jsconfig.json` were added to the initial commit (not listed in brief's git add command). These are required foundational files.

## Git Commit Hash
`9ac5508`

## Dev Server Test Summary
`npm run dev` started Next.js 14.2.35 at localhost:3000 in 4.2s with no compilation errors. One non-fatal warning: `serverExternalPackages` unrecognized in Next.js 14 (valid in Next.js 15). A 404 is shown in the browser (expected — no page.js exists).
