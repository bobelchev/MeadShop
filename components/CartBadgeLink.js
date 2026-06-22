'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartBadgeLink({ href, label }) {
  const { totalItems } = useCart();
  return (
    <Link
      href={href}
      className="relative font-body text-sm font-medium text-bark-600 hover:text-honey-700 px-3 py-2 rounded-md hover:bg-honey-50 transition-all duration-180"
    >
      {label}
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-honey-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  );
}
