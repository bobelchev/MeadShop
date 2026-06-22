import db from '@/lib/db';
import { updateOrderStatus } from './actions';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all();

  return (
    <div>
      <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Admin</span>
        <a href="/admin/orders" className="text-sm font-medium text-gray-900 underline">Orders</a>
        <a href="/admin/wholesale" className="text-sm text-gray-600 hover:text-gray-900">Wholesale</a>
        <a href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">Products</a>
        <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">Logout</a>
      </nav>

      <h1 className="text-xl font-bold text-gray-800 mb-4">Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-500">{order.id}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{order.customer_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.phone}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.item_count}</td>
                  <td className="py-3 pr-4 text-gray-800">{Number(order.total_amount).toFixed(2)} BGN</td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <form action={updateOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
                      <select
                        name="newStatus"
                        defaultValue={order.status}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-gray-800 text-white rounded px-2 py-1 text-xs hover:bg-gray-700"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
