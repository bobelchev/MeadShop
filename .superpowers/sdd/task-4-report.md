# Task 4 Report: Wholesale Product Picker

## Status
COMPLETE

## Files Changed
- `app/[locale]/wholesale/page.js` — fetches active products from DB, passes to WholesaleForm; layout changed from `section-narrow` to `section` with `max-w-5xl mx-auto`
- `app/[locale]/wholesale/WholesaleForm.js` — full rewrite with two-column layout, product picker (right), contact form + selection summary (left), qty/note per product
- `app/[locale]/wholesale/actions.js` — decodes `product_selections` JSON, serializes into `message` field, no longer uses `estimated_volume`

## Commit Hashes
- `518b3b2` — feat: wholesale product picker with qty and per-product notes
- `87cc584` — fix: use empty string for nullable email to satisfy NOT NULL constraint

## Bug Fixed
The schema has `email TEXT NOT NULL` but the brief's action code passed `email: email || null` for empty emails. This caused a SQLite constraint error on submission. Fixed by using `email || ''` instead of `email || null`.

## Browser Verification

### /bg/wholesale
- Two-column grid renders (stacks on mobile)
- All 3 products appear in picker on the right with "Добави" buttons
- Clicking "Добави" adds product to selection on the left with qty spinner and note input
- Button on right turns to "✓" (disabled) after adding
- "Премахни" button removes the product from selection
- Submitting without a product selected shows error: "Моля, изберете поне един продукт."
- Successful submission (Тест ЕООД / Иван Иванов / 0888123456, Липов мед × 10 [въпрос за опаковка]) shows success heading "Получихме вашето запитване!"

### /admin/wholesale
- Inquiry appears with message: `Липов мед × 10 [въпрос за опаковка]` — serialized correctly

### /en/wholesale
- All strings in English (Company, Contact person, Phone, E-mail optional, Select products, Add, Send inquiry)
- Product names displayed in English (Linden Honey, Traditional Mead)

## Concerns
None beyond the email NOT NULL bug (fixed). The schema's `estimated_volume` column still exists but is no longer written to — harmless, consistent with the brief's intent to drop it from the action.

---

## Fix Report (commit f02ddea)

### Fix 1 — `app/[locale]/wholesale/page.js`
Added `export const dynamic = 'force-dynamic';` after imports, before `generateMetadata`. This prevents Next.js from attempting to prerender the page at build time when `DATABASE_PATH` is not available (Railway build environment).

### Fix 2 — `app/[locale]/wholesale/actions.js`
Replaced client-supplied `s.name`/`s.qty` message-building with server-side validated logic:
- Parses `product_selections` JSON
- Looks up each `id` in the DB (`WHERE id IN (...) AND active = 1`) to get authoritative `name_bg` and verify the product is active
- Uses `name_bg` from DB (not client-supplied name)
- Clamps qty to a positive integer via `Math.max(1, parseInt(s.qty) || 1)`
- Truncates note to 500 chars via `.slice(0, 500)`
- Filters out any ids not found in DB
- Returns `{ error: 'error_no_products' }` if filtered list produces an empty message

### Commit
`f02ddea` — fix: force-dynamic on wholesale page; validate product selections server-side
