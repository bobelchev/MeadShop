import { getTranslations } from 'next-intl/server';
import db from '@/lib/db';
import ShopGrid from './ShopGrid';

export default async function ShopPage({ searchParams }) {
  const t = await getTranslations('shop');
  const params = await searchParams;
  const initialCategory = ['honey', 'mead'].includes(params?.category)
    ? params.category
    : 'all';

  const products = db.prepare(`
    SELECT p.*,
      (SELECT pi.image_path FROM product_images pi
       WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS first_image
    FROM products p WHERE p.active = 1 ORDER BY p.category, p.id
  `).all();

  return (
    <div className="section max-w-7xl mx-auto">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-bark-700 mb-2">
          {t('heading')}
        </h1>
        <p className="font-body text-bark-500 text-lg">{t('subheading')}</p>
      </div>

      <ShopGrid products={products} initialCategory={initialCategory} />
    </div>
  );
}
