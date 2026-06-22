'use client';

import { useTranslations } from 'next-intl';
import { confirmAge } from './actions';
import Link from 'next/link';

export default function AgeGateForm({ locale, returnTo }) {
  const t = useTranslations('age_gate');
  const confirmAgeWithArgs = confirmAge.bind(null, locale, returnTo);

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <form action={confirmAgeWithArgs}>
        <button type="submit" className="btn-primary w-full">
          {t('confirm')}
        </button>
      </form>
      <Link href={`/${locale}`} className="btn-ghost w-full text-center">
        {t('decline')}
      </Link>
    </div>
  );
}
