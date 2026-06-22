'use client';
import { deleteProduct } from './actions';

export default function DeleteProductButton({ productId }) {
  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await deleteProduct(productId);
  }
  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-xs font-medium ml-3"
    >
      Delete
    </button>
  );
}
