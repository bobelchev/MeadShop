import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import ProductDetail from './ProductDetail';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const locale = await getLocale();

  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND active = 1')
    .get(Number(id));

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} locale={locale} />;
}
