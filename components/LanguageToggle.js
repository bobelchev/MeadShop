'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'bg' ? 'en' : 'bg';
  // Swap the locale segment: /bg/shop → /en/shop
  const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <a
      href={newPath}
      className="font-body text-xs font-semibold text-bark-600 hover:text-honey-700 px-2 py-1 rounded border border-cream-300 hover:border-honey-300 hover:bg-honey-50 transition-all duration-180"
    >
      {otherLocale.toUpperCase()}
    </a>
  );
}
