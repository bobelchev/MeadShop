# Task 2 Report: Admin order detail view

**Status:** DONE

## Files Created / Modified

- **Created:** `app/admin/(protected)/orders/[id]/page.js` — order detail page showing customer info and line items
- **Modified:** `app/admin/(protected)/orders/page.js` — customer name cell wrapped in `<a href="/admin/orders/${order.id}">` link

## Commit Hash

`aae1be5`

## What Was Verified in the Browser

- `/admin/orders` list renders customer names as blue clickable links pointing to `/admin/orders/1`
- Clicking the link navigates to `/admin/orders/1`, which renders:
  - "Order #1" heading with a "confirmed" status badge
  - Customer info block: Customer, Phone, Email, Delivery (label resolved: "Ekont — office pickup"), Address, City, Date
  - Items table: 2 line items (Липов мед 1×18.00 BGN, Традиционна медовина 2×32.00 BGN) with correct subtotals and total of 82.00 BGN
- "← Back to orders" link returns to the list
- `/admin/orders/9999` (non-existent) correctly returns a 404 page via `notFound()`

## Concerns

None.
