'use client';

import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/wholesale', label: 'Wholesale' },
  { href: '/admin/products', label: 'Products' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
      <span className="font-semibold text-gray-900">Admin</span>
      {LINKS.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className={`text-sm ${
            pathname.startsWith(href)
              ? 'font-medium text-gray-900 underline'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
        </a>
      ))}
      <a href="/admin/logout" className="ml-auto text-sm text-red-600 hover:text-red-800">
        Logout
      </a>
    </nav>
  );
}
