### Task 2: Set up next-intl and [locale] routing

**Files:**
- Create: `middleware.js`, `i18n/request.js`, `messages/bg.json`, `messages/en.json`
- Modify: `app/layout.js`
- Create: `app/[locale]/layout.js`, `app/[locale]/page.js`

- [ ] **Step 1: Create middleware.js (project root)**

```javascript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
});

export const config = {
  // Match all paths except /api/*, /admin/*, /_next/*, and static files (contain a dot)
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
```

- [ ] **Step 2: Create i18n/request.js**

```javascript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

> If you get a TypeScript/runtime error about `locale` being undefined, your installed next-intl version uses the newer `requestLocale` API. Replace the callback with:
> ```javascript
> async ({ requestLocale }) => {
>   const locale = await requestLocale;
>   return { locale, messages: (await import(`../messages/${locale}.json`)).default };
> }
> ```

- [ ] **Step 3: Create messages/bg.json**

```json
{
  "nav": {
    "home": "Начало",
    "shop": "Магазин",
    "wholesale": "Едро",
    "about": "За нас",
    "contact": "Контакти",
    "cart": "Количка"
  }
}
```

- [ ] **Step 4: Create messages/en.json**

```json
{
  "nav": {
    "home": "Home",
    "shop": "Shop",
    "wholesale": "Wholesale",
    "about": "About",
    "contact": "Contact",
    "cart": "Cart"
  }
}
```

- [ ] **Step 5: Replace app/layout.js**

```javascript
import './globals.css';

export const metadata = {
  title: 'Мед & Медовина',
  description: 'Онлайн магазин за мед и медовина',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
```

Note: `lang="bg"` is a static placeholder for the skeleton. The locale layout will own this dynamically when built out.

- [ ] **Step 6: Create app/[locale]/layout.js**

```javascript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
```

Note: Header is added here in Task 3.

- [ ] **Step 7: Create app/[locale]/page.js**

```javascript
export default function HomePage() {
  return <p>Home — coming soon.</p>;
}
```

- [ ] **Step 8: Verify locale routing**

```bash
npm run dev
```

Check:
- `http://localhost:3000` — redirects to `http://localhost:3000/bg`
- `http://localhost:3000/bg` — shows "Home — coming soon."
- `http://localhost:3000/en` — shows "Home — coming soon."
- `http://localhost:3000/admin/login` — shows 404 (admin page not created yet; correct — middleware skips /admin)

Expected: no console errors about missing messages.

- [ ] **Step 9: Commit**

```bash
git add middleware.js i18n/ messages/ app/layout.js app/[locale]/
git commit -m "feat: add next-intl i18n with bg/en locales and [locale] routing"
```

---

