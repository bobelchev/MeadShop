import db from '@/lib/db';
import { updateWholesaleStatus } from './actions';

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-800',
};

const STATUSES = ['new', 'contacted', 'closed'];

export default function AdminWholesalePage() {
  const inquiries = db.prepare(
    'SELECT * FROM wholesale_inquiries ORDER BY created_at DESC'
  ).all();

  return (
    <div>
      <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Admin</span>
        <a href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">Orders</a>
        <a href="/admin/wholesale" className="text-sm font-medium text-gray-900 underline">Wholesale</a>
        <a href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">Products</a>
        <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">Logout</a>
      </nav>

      <h1 className="text-xl font-bold text-gray-800 mb-4">Wholesale Inquiries ({inquiries.length})</h1>

      {inquiries.length === 0 ? (
        <p className="text-gray-500">No inquiries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Volume</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-500">{inq.id}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{inq.company_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{inq.contact_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{inq.phone}</td>
                  <td className="py-3 pr-4 text-gray-500">{inq.email ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-500">{inq.estimated_volume ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-600 max-w-xs">
                    {inq.message ? inq.message.slice(0, 100) + (inq.message.length > 100 ? '…' : '') : '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(inq.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[inq.status] ?? 'bg-gray-100 text-gray-800'}`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <form action={updateWholesaleStatus.bind(null, inq.id)} className="flex items-center gap-2">
                      <select
                        name="newStatus"
                        defaultValue={inq.status}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="bg-gray-800 text-white rounded px-2 py-1 text-xs hover:bg-gray-700">
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
