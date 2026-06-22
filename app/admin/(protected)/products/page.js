import db from '@/lib/db';

export default function AdminProductsPage() {
  const products = db.prepare('SELECT * FROM products ORDER BY category, name_bg').all();

  return (
    <div>
      <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Admin</span>
        <a href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">Orders</a>
        <a href="/admin/wholesale" className="text-sm text-gray-600 hover:text-gray-900">Wholesale</a>
        <a href="/admin/products" className="text-sm font-medium text-gray-900 underline">Products</a>
        <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">Logout</a>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Products ({products.length})</h1>
        <a href="/admin/products/new"
          className="bg-gray-800 text-white rounded px-3 py-1.5 text-sm hover:bg-gray-700">
          + New product
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-600">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Name (BG)</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Variant</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-500">{p.id}</td>
                <td className="py-3 pr-4 font-medium text-gray-800">{p.name_bg}</td>
                <td className="py-3 pr-4 text-gray-600">{p.category}</td>
                <td className="py-3 pr-4 text-gray-600">{p.variant}</td>
                <td className="py-3 pr-4 text-gray-800">{Number(p.price_bgn).toFixed(2)} BGN</td>
                <td className="py-3 pr-4 text-gray-600">{p.stock_qty}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'yes' : 'no'}
                  </span>
                </td>
                <td className="py-3">
                  <a href={`/admin/products/${p.id}`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
