import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import CookieBanner from '@/components/CookieBanner';
import SplashScreen from '@/components/SplashScreen';
import { CartProvider } from '@/context/CartContext';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();
  const cookieStore = await cookies();
  const consent = cookieStore.get('cookie_consent')?.value ?? null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <SplashScreen />
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center text-xs text-stone-400 flex items-center justify-center gap-3 flex-wrap">
            <Link href={`/${locale}/privacy`} className="underline hover:text-stone-600 transition-colors">
              {locale === 'bg' ? 'Поверителност' : 'Privacy Policy'}
            </Link>
            <span>·</span>
            <span>
              Built with{' '}
              <a
                href="https://claude.ai/code"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-600 transition-colors"
              >
                Claude Code
              </a>
            </span>
          </footer>
          <CookieBanner initialConsent={consent} />
        </div>
      </CartProvider>
    </NextIntlClientProvider>
  );
}
