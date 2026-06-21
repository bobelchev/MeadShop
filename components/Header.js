import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default async function Header() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  return (
    <header className="border-b py-4 px-6 flex items-center justify-between">
      <Link href={`/${locale}`} className="font-bold text-lg">
        Мед &amp; Медовина
      </Link>
      <nav className="flex gap-6 items-center text-sm">
        <Link href={`/${locale}/shop`}>{t('shop')}</Link>
        <Link href={`/${locale}/wholesale`}>{t('wholesale')}</Link>
        <Link href={`/${locale}/about`}>{t('about')}</Link>
        <Link href={`/${locale}/contact`}>{t('contact')}</Link>
        <Link href={`/${locale}/cart`}>{t('cart')}</Link>
        <LanguageToggle />
      </nav>
    </header>
  );
}
