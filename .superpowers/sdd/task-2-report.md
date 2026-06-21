# Task 2 Report: next-intl i18n with bg/en locales and [locale] routing

## Status: DONE

## Commit
`30334e9` — feat: add next-intl i18n with bg/en locales and [locale] routing

## Files Created / Modified

| File | Action | Notes |
|------|--------|-------|
| `middleware.js` | Created | next-intl middleware, locales: bg/en, defaultLocale: bg |
| `i18n/request.js` | Modified | Used `requestLocale` async API (next-intl@3 new API) |
| `messages/bg.json` | Modified | Added nav keys: home/shop/wholesale/about/contact/cart |
| `messages/en.json` | Modified | Added nav keys: home/shop/wholesale/about/contact/cart |
| `app/layout.js` | Modified | Stripped Inter font, minimal shell, `lang="bg"` placeholder |
| `app/[locale]/layout.js` | Created | NextIntlClientProvider + await params pattern for Next.js 14 |
| `app/[locale]/page.js` | Created | Minimal placeholder: `<p>Home — coming soon.</p>` |

## Key Decisions

- Used `requestLocale` (async) API in `i18n/request.js` as required by next-intl@3 (not the legacy `{ locale }` sync API)
- `app/[locale]/layout.js` uses `await params` for Next.js 14 async params compatibility
- `next.config.mjs` was already correctly configured with `createNextIntlPlugin('./i18n/request.js')` from Task 1 — no changes needed

## Issues Encountered

- **Dev server startup on Windows**: Multiple `npm run dev` invocations left stale node processes holding port 3002 in a half-started state (TCP LISTEN but not serving). Resolved by explicitly specifying `--port 3010` on a clean process. Root cause: PowerShell job-based background processes inherited the port-in-use state from prior runs.
- `npm run build` succeeded cleanly (used to verify code correctness before server testing).

## Dev Server Verification

Server started on `http://localhost:3010` (ports 3000–3002 were occupied), "Ready in 4.6s".

| URL | Expected | Actual |
|-----|----------|--------|
| `http://localhost:3010/` | 307 redirect to `/bg` | 307 -> `http://localhost:3010/bg` |
| `http://localhost:3010/bg` | 200 "Home — coming soon." | 200, `<p>Home — coming soon.</p>`, BG messages loaded |
| `http://localhost:3010/en` | 200 "Home — coming soon." | 200, `<p>Home — coming soon.</p>`, EN messages loaded |

Messages confirmed present in RSC payload:
- `/bg`: `{"nav":{"home":"Начало","shop":"Магазин","wholesale":"Едро","about":"За нас","contact":"Контакти","cart":"Количка"}}`
- `/en`: `{"nav":{"home":"Home","shop":"Shop","wholesale":"Wholesale","about":"About","contact":"Contact","cart":"Cart"}}`

No console errors about missing messages (build output was clean; `✓ Compiled successfully`).
