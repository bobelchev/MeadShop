### Task 1: Initialize project, git, and dependencies

**Files:**
- Create: standard Next.js scaffold (via create-next-app)
- Modify: `next.config.mjs`
- Create: `.gitignore`, `.env.local`

- [ ] **Step 1: Run create-next-app**

Run from `C:\Users\bobel\Desktop\ClaudeTestProject\MeadShop`:

```bash
npx create-next-app@latest . --js --app --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm --yes
```

Expected: `Success! Created app at ...` — `package.json`, `app/`, `public/`, `tailwind.config.js`, etc. appear. The existing `CLAUDE.md` and `img/` are untouched.

If create-next-app refuses the non-empty directory: answer `y` at the "proceed anyway?" prompt, or omit `--yes` and answer interactively.

> **Windows note:** `better-sqlite3` (installed next) is a native Node addon requiring C++ build tools. If the install fails with node-gyp errors, install them first:
> `npm install --global windows-build-tools`
> Or via Visual Studio Installer → "Desktop development with C++" workload.

- [ ] **Step 2: Install extra dependencies**

```bash
npm install next-intl@3 better-sqlite3
```

Expected: both packages appear in `package.json` dependencies.

- [ ] **Step 3: Replace next.config.mjs**

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Create .env.local**

```
DATABASE_PATH=./data/shop.db
```

- [ ] **Step 5: Create .gitignore**

```
# dependencies
/node_modules/

# next.js
/.next/
/out/

# env files
.env.local
.env*.local

# db runtime data (created at runtime, not source)
/data/

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 6: Delete default Next.js placeholder files**

Delete `app/page.js` (the Next.js welcome page — replaced by `app/[locale]/page.js` in Task 2).
Delete `public/next.svg` and `public/vercel.svg` (default SVGs).

- [ ] **Step 7: Initialize git and make initial commit**

```bash
git init
git add CLAUDE.md img/ .gitignore next.config.mjs package.json package-lock.json tailwind.config.js postcss.config.mjs app/globals.css app/layout.js .eslintrc.json
git commit -m "chore: initialize Next.js 15 project with Tailwind"
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`. You'll get a 404 (we deleted the default page — that's fine). No compilation errors in the terminal. Stop with Ctrl+C.

---

