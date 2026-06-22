import { createProduct } from '../actions';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Admin</span>
        <a href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">Orders</a>
        <a href="/admin/wholesale" className="text-sm text-gray-600 hover:text-gray-900">Wholesale</a>
        <a href="/admin/products" className="text-sm font-medium text-gray-900 underline">Products</a>
        <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">Logout</a>
      </nav>
      <ProductForm action={createProduct} title="New Product" />
    </div>
  );
}
