import db from '@/lib/db';
import { notFound } from 'next/navigation';

const DELIVERY_LABELS = {
  ekont_office: 'Ekont — office pickup',
  ekont_door: 'Ekont — door delivery',
  speedy_office: 'Speedy — office pickup',
  speedy_door: 'Speedy — door delivery',
};

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) notFound();

  const items = db.prepare(`
    SELECT oi.qty, oi.unit_price, p.name_bg, p.name_en, p.category
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(id);

  return (
    <div className="max-w-2xl">
      <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to orders
      </a>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Order #{order.id}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-sm space-y-1">
        <p><span className="text-gray-500 w-32 inline-block">Customer</span> <span className="font-medium text-gray-800">{order.customer_name}</span></p>
        <p><span className="text-gray-500 w-32 inline-block">Phone</span> {order.phone}</p>
        {order.email && <p><span className="text-gray-500 w-32 inline-block">Email</span> {order.email}</p>}
        <p><span className="text-gray-500 w-32 inline-block">Delivery</span> {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}</p>
        <p><span className="text-gray-500 w-32 inline-block">Address</span> {order.address_or_office}</p>
        <p><span className="text-gray-500 w-32 inline-block">City</span> {order.city}</p>
        {order.notes && <p><span className="text-gray-500 w-32 inline-block">Notes</span> {order.notes}</p>}
        <p><span className="text-gray-500 w-32 inline-block">Date</span> {new Date(order.created_at).toLocaleString('bg-BG')}</p>
      </div>

      <h2 className="text-base font-semibold text-gray-800 mb-2">Items</h2>
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit price</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-800">{item.name_bg}</td>
              <td className="py-2 pr-4 text-gray-500">{item.category}</td>
              <td className="py-2 pr-4 text-gray-700">{item.qty}</td>
              <td className="py-2 pr-4 text-gray-700">{Number(item.unit_price).toFixed(2)} BGN</td>
              <td className="py-2 text-right text-gray-800">{(item.qty * item.unit_price).toFixed(2)} BGN</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="py-3 pr-4 text-right font-semibold text-gray-700">Total</td>
            <td className="py-3 text-right font-bold text-gray-900">{Number(order.total_amount).toFixed(2)} BGN</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
