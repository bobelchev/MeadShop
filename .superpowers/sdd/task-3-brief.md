### Task 3: Header with LanguageToggle

**Files:**
- Create: `components/LanguageToggle.js`, `components/Header.js`
- Modify: `app/[locale]/layout.js`

- [ ] **Step 1: Create components/LanguageToggle.js**

```javascript
'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'bg' ? 'en' : 'bg';
  // Swap the locale segment: /bg/shop → /en/shop
  const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <a href={newPath} className="text-sm font-semibold underline">
      {otherLocale.toUpperCase()}
    </a>
  );
}
```

- [ ] **Step 2: Create components/Header.js**

```javascript
import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default async function Header() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  return (
    <header className="border-b py-4 px-6 flex items-center justify-between">
      <Link href={`/${locale}`} className="font-bold text-lg">
        Мед &amp; Медовина
      </Link>
      <nav className="flex gap-6 items-center text-sm">
        <Link href={`/${locale}/shop`}>{t('shop')}</Link>
        <Link href={`/${locale}/wholesale`}>{t('wholesale')}</Link>
        <Link href={`/${locale}/about`}>{t('about')}</Link>
        <Link href={`/${locale}/contact`}>{t('contact')}</Link>
        <Link href={`/${locale}/cart`}>{t('cart')}</Link>
        <LanguageToggle />
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Add Header to app/[locale]/layout.js**

```javascript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/Header';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 4: Verify header and language toggle**

```bash
npm run dev
```

Visit `http://localhost:3000/bg`:
- Header shows "Мед & Медовина" and nav links in Bulgarian
- "EN" link is visible in the header

Click "EN":
- URL changes to `http://localhost:3000/en`
- Nav links are now in English: Shop, Wholesale, About, Contact, Cart
- "BG" link is visible

Click "BG":
- Returns to `http://localhost:3000/bg` with Bulgarian nav

- [ ] **Step 5: Commit**

```bash
git add components/ app/[locale]/layout.js
git commit -m "feat: add Header with LanguageToggle for locale switching"
```

---

