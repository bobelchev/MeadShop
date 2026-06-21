# Task 3 Report: Header with LanguageToggle

**Status:** DONE
**Commit:** 76845f4
**Test summary:** `/bg` renders Bulgarian nav with "EN" toggle → `/en` renders English nav with "BG" toggle; verified via live `npm run dev` HTTP responses.

## Files changed
- Created: `components/LanguageToggle.js` — `'use client'` component using `useLocale` + `usePathname`; renders `<a href>` for full-page navigation locale swap
- Created: `components/Header.js` — async Server Component using `getTranslations('nav')` + `getLocale()` from `next-intl/server`
- Modified: `app/[locale]/layout.js` — added `import Header from '@/components/Header'` and `<Header />` above `<main>`

## Verification
- `GET /bg` → HTTP 200; header contains `<a href="/bg">Мед &amp; Медовина</a>`, Bulgarian nav links (Магазин, Едро, За нас, Контакти, Количка), and `<a href="/en" class="text-sm font-semibold underline">EN</a>`
- `GET /en` → HTTP 200; English nav links (Shop, Wholesale, About, Contact, Cart) and `<a href="/bg" class="text-sm font-semibold underline">BG</a>`

## Concerns
None. The `/bg/shop` subpath 404s as expected — the shop page does not exist yet in this skeleton.
