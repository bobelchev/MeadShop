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
    <div>
      <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Admin</span>
        <a href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">Orders</a>
        <a href="/admin/wholesale" className="text-sm text-gray-600 hover:text-gray-900">Wholesale</a>
        <a href="/admin/products" className="text-sm font-medium text-gray-900 underline">Products</a>
        <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">Logout</a>
      </nav>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        initialValues={product}
        initialImages={images}
        title={`Edit: ${product.name_bg}`}
      />
    </div>
  );
}
