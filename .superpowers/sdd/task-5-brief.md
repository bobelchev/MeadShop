### Task 5: Scaffold all pages, API stubs, and image folders

**Files:** All remaining pages, admin routes, API stubs, and `.gitkeep` files.

- [ ] **Step 1: Create public image folders with .gitkeep**

Create three empty files:
- `public/img/products/.gitkeep`
- `public/img/hero/.gitkeep`
- `public/img/brand/.gitkeep`

Each file is completely empty (0 bytes). Do not add any image files.

- [ ] **Step 2: Create locale page placeholders**

`app/[locale]/shop/page.js`:
```javascript
export default function ShopPage() {
  return <p>Shop — coming soon.</p>;
}
```

`app/[locale]/shop/[id]/page.js`:
```javascript
export default function ProductPage() {
  return <p>Product detail — coming soon.</p>;
}
```

`app/[locale]/cart/page.js`:
```javascript
export default function CartPage() {
  return <p>Cart — coming soon.</p>;
}
```

`app/[locale]/checkout/page.js`:
```javascript
export default function CheckoutPage() {
  return <p>Checkout — coming soon.</p>;
}
```

`app/[locale]/order-confirmation/page.js`:
```javascript
export default function OrderConfirmationPage() {
  return <p>Order confirmed — coming soon.</p>;
}
```

`app/[locale]/wholesale/page.js`:
```javascript
export default function WholesalePage() {
  return <p>Wholesale inquiry — coming soon.</p>;
}
```

`app/[locale]/about/page.js`:
```javascript
export default function AboutPage() {
  return <p>About — coming soon.</p>;
}
```

`app/[locale]/contact/page.js`:
```javascript
export default function ContactPage() {
  return <p>Contact — coming soon.</p>;
}
```

- [ ] **Step 3: Create admin layout and pages**

`app/admin/layout.js`:
```javascript
export default function AdminLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
```

Note: Admin has its own root layout because it bypasses the locale layout tree.

`app/admin/login/page.js`:
```javascript
export default function AdminLoginPage() {
  return <p>Admin login — coming soon.</p>;
}
```

`app/admin/orders/page.js`:
```javascript
export default function AdminOrdersPage() {
  return <p>Admin orders — coming soon.</p>;
}
```

`app/admin/wholesale/page.js`:
```javascript
export default function AdminWholesalePage() {
  return <p>Admin wholesale — coming soon.</p>;
}
```

- [ ] **Step 4: Create API route stubs**

`app/api/products/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ products: [] });
}
```

`app/api/products/[id]/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json({ product: null, id });
}
```

`app/api/orders/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ orders: [] });
}
```

`app/api/wholesale/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ inquiries: [] });
}
```

- [ ] **Step 5: Verify all routes**

```bash
npm run dev
```

Check every route returns the expected response:

| URL | Expected |
|-----|----------|
| `http://localhost:3000` | Redirects to `/bg` |
| `http://localhost:3000/bg` | "Home — coming soon." with header |
| `http://localhost:3000/en` | "Home — coming soon." with header (English nav) |
| `http://localhost:3000/bg/shop` | "Shop — coming soon." |
| `http://localhost:3000/bg/shop/1` | "Product detail — coming soon." |
| `http://localhost:3000/bg/cart` | "Cart — coming soon." |
| `http://localhost:3000/bg/checkout` | "Checkout — coming soon." |
| `http://localhost:3000/bg/order-confirmation` | "Order confirmed — coming soon." |
| `http://localhost:3000/bg/wholesale` | "Wholesale inquiry — coming soon." |
| `http://localhost:3000/bg/about` | "About — coming soon." |
| `http://localhost:3000/bg/contact` | "Contact — coming soon." |
| `http://localhost:3000/admin/login` | "Admin login — coming soon." (no locale header) |
| `http://localhost:3000/admin/orders` | "Admin orders — coming soon." |
| `http://localhost:3000/admin/wholesale` | "Admin wholesale — coming soon." |
| `http://localhost:3000/api/products` | `{"products":[]}` |
| `http://localhost:3000/api/products/1` | `{"product":null,"id":"1"}` |
| `http://localhost:3000/api/orders` | `{"orders":[]}` |
| `http://localhost:3000/api/wholesale` | `{"inquiries":[]}` |

Also verify: language toggle on `/bg/shop` navigates to `/en/shop` (not just `/en`).

- [ ] **Step 6: Final commit**

```bash
git add app/ public/ docs/
git commit -m "feat: scaffold all locale pages, admin pages, API stubs, and image folders"
```

---

## Self-Review

**Spec coverage:**
- ✅ Next.js App Router, Tailwind CSS, JavaScript only (Task 1)
- ✅ Git repo + .gitignore for Next.js (Task 1)
- ✅ next-intl with bg/en, `[locale]` segment, locale toggle in header (Tasks 2–3)
- ✅ SQLite schema matching CLAUDE.md data model, seed script, `db/init.js` (Task 4)
- ✅ `DATABASE_PATH` env var, never hardcoded to `/data/shop.db` (Tasks 1, 4)
- ✅ Empty image folders with `.gitkeep`, no placeholder images (Task 5)
- ✅ All routes from CLAUDE.md scaffolded (Task 5)
- ✅ Hard rules: no payment integration, no TypeScript, orders created as `pending`

**Placeholder scan:** No TBDs or "implement later" in any step — all steps include concrete code or commands with expected output.

**Consistency check:**
- `db/schema.js` uses `module.exports` → `db/init.js` and `db/seed.js` use `require()` ✅
- `lib/db.js` uses `import/export` (Next.js compiles it) ✅
- All page paths match CLAUDE.md exactly (including `/order-confirmation` not `/order-confirmation/[id]`) ✅
- All four DB tables match CLAUDE.md data model field-for-field ✅
- Admin routes (`/admin/login`, `/admin/orders`, `/admin/wholesale`) are NOT under `[locale]` ✅
- Middleware matcher excludes `/admin/*` from locale routing ✅
