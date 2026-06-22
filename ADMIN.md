# Admin Manual

## Access

Go to `/admin/login` and enter the admin password (set via the `ADMIN_PASSWORD` environment variable). Session is stored in a cookie; you'll be redirected to login if it expires.

Nav links: **Orders | Wholesale | Products**

---

## Orders (`/admin/orders`)

Lists all orders newest-first. Columns: ID, customer name, phone, item count, total (BGN), date, status.

**Order statuses** (in sequence): `pending` → `confirmed` → `shipped` → `delivered`. Can also be set to `cancelled`.

New orders arrive as `pending`. To update: pick a status from the dropdown in the row and click **Save**.

> Orders are never auto-confirmed — you must manually move them to `confirmed` before fulfilling.

---

## Wholesale Inquiries (`/admin/wholesale`)

Lists all B2B inquiry form submissions. Columns: company, contact, phone, email, estimated volume, message (truncated to 100 chars), date, status.

**Statuses**: `new` → `contacted` → `closed`. Update the same way as orders — dropdown + **Save**.

---

## Products (`/admin/products`)

Lists all products (both active and inactive) sorted by category then name.

**Create:** Click **+ New product** → fill the form → **Save**.

**Edit:** Click **Edit** on any row → modify fields → **Save**.

**Delete:** Click **Delete** on the row. Blocked if the product has any orders — set it to inactive instead.

### Product form fields

| Field | Notes |
|---|---|
| Name (BG) / Name (EN) | Both required |
| Category | `honey` or `mead` |
| Variant | Optional label, e.g. `700г` |
| Price (BGN) | Decimal, e.g. `12.50` |
| Stock qty | Integer |
| Description (BG) / (EN) | Optional, shown on product page |
| Images | Upload `.webp` files; click **×** on a thumbnail to remove an existing image |
| Active | Unchecked = hidden from shop, still in DB |
