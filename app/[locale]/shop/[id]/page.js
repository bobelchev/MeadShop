import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import ProductDetail from './ProductDetail';
import { SITE_URL } from '@/lib/siteUrl';
import { getLocalizedField } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const product = db
    .prepare('SELECT name_bg, name_en, description_bg, description_en FROM products WHERE id = ? AND active = 1')
    .get(Number(id));
  if (!product) return {};
  const name = getLocalizedField(product, 'name', locale);
  const description = getLocalizedField(product, 'description', locale);
  return {
    title: `${name} — Пчелин Мед`,
    description: description?.slice(0, 160) ?? '',
    alternates: { canonical: `${SITE_URL}/${locale}/shop/${id}` },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const locale = await getLocale();

  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND active = 1')
    .get(Number(id));

  if (!product) {
    notFound();
  }

  const images = db
    .prepare('SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order')
    .all(Number(id));

  return <ProductDetail product={product} locale={locale} images={images} />;
}
