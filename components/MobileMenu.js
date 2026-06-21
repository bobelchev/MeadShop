'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MobileMenu({ links }) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Затвори меню' : 'Отвори меню'}
        aria-expanded={open}
        className="p-2 rounded-md text-bark-600 hover:text-honey-700 hover:bg-honey-50 transition-all duration-180"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M4 4l12 12M16 4L4 16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          {/* Drawer — sits just below the h-16 (64px) sticky header */}
          <div className="fixed top-16 inset-x-0 z-50 bg-cream-50 border-b border-cream-200 shadow-card">
            <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-col">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-body text-base font-medium text-bark-700 hover:text-honey-700 py-3 border-b border-cream-200 last:border-0 transition-colors duration-180"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
