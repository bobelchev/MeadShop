import db from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meadshop.bg';
const LOCALES = ['bg', 'en'];
const STATIC_PATHS = ['', '/shop', '/about', '/contact', '/wholesale'];

export default function sitemap() {
  const staticEntries = STATIC_PATHS.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${p}`,
      changeFrequency: p === '' ? 'weekly' : 'monthly',
      priority: p === '' ? 1 : 0.8,
    }))
  );

  const products = db.prepare('SELECT id FROM products WHERE active = 1').all();

  const productEntries = products.flatMap(({ id }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/shop/${id}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...productEntries];
}
