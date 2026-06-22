import { getTranslations, getLocale } from 'next-intl/server';
import AgeGateForm from './AgeGateForm';

export default async function AgeGatePage({ searchParams }) {
  const t = await getTranslations('age_gate');
  const locale = await getLocale();
  const params = await searchParams;
  const returnTo = params?.returnTo || `/${locale}/shop`;

  return (
    <div className="section-narrow flex flex-col items-center text-center gap-6 py-24">
      <div className="w-16 h-16 rounded-full bg-mead-placeholder flex items-center justify-center mb-2" />
      <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700">
        {t('heading')}
      </h1>
      <p className="font-body text-lg text-bark-500 max-w-md leading-relaxed">
        {t('body')}
      </p>
      <AgeGateForm locale={locale} returnTo={returnTo} />
    </div>
  );
}
