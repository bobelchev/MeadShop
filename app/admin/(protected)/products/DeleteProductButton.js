'use client';
import { deleteProduct } from './actions';

export default function DeleteProductButton({ productId }) {
  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(productId);
    } catch (err) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) return;
      alert(err.message ?? 'Delete failed.');
    }
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
