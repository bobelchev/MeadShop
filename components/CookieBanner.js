'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function CookieBanner({ initialConsent }) {
  const [visible, setVisible] = useState(!initialConsent);
  const t = useTranslations('cookie_banner');
  const locale = useLocale();

  function accept() {
    document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bark-700 text-cream-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-cream-100 mb-0.5">{t('heading')}</p>
          <p className="font-body text-sm text-cream-200 leading-relaxed">{t('body')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${locale}/contact`}
            className="font-body text-sm text-cream-300 hover:text-cream-100 underline underline-offset-2 whitespace-nowrap"
          >
            {t('more_info')}
          </Link>
          <button
            onClick={accept}
            className="btn-ghost-inverted text-sm px-4 py-2 whitespace-nowrap"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
