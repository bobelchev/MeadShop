import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/Header';
import CookieBanner from '@/components/CookieBanner';
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
          <Header />
          <main className="flex-1">{children}</main>
          <CookieBanner initialConsent={consent} />
        </div>
      </CartProvider>
    </NextIntlClientProvider>
  );
}
