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
    <a href={newPath} className="text-sm font-semibold underline">
      {otherLocale.toUpperCase()}
    </a>
  );
}
