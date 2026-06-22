import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';
import MobileMenu from './MobileMenu';
import CartBadgeLink from './CartBadgeLink';

export default async function Header() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  const navLinks = [
    { href: `/${locale}/shop`, label: t('shop') },
    { href: `/${locale}/wholesale`, label: t('wholesale') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/cart`, label: t('cart') },
  ];

  return (
    <header className="bg-cream-50 border-b border-cream-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-display text-xl font-bold text-bark-700 hover:text-honey-600 transition-colors duration-180"
        >
          Мед &amp; Медовина
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) =>
            href.endsWith('/cart') ? (
              <CartBadgeLink key={href} href={href} label={label} />
            ) : (
              <Link
                key={href}
                href={href}
                className="font-body text-sm font-medium text-bark-600 hover:text-honey-700 px-3 py-2 rounded-md hover:bg-honey-50 transition-all duration-180"
              >
                {label}
              </Link>
            )
          )}
          <div className="ml-2 pl-2 border-l border-cream-300">
            <LanguageToggle />
          </div>
        </nav>

        {/* Mobile controls — hidden on desktop */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
