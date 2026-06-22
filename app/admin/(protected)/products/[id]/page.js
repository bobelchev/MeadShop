import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { updateProduct } from '../actions';
import ProductForm from '../ProductForm';

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!product) notFound();

  const images = db
    .prepare('SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order')
    .all(Number(id));

  return (
    <ProductForm
      action={updateProduct.bind(null, product.id)}
      initialValues={product}
      initialImages={images}
      title={`Edit: ${product.name_bg}`}
    />
  );
}
