import { getTranslations } from 'next-intl/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meadshop.bg';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: `${SITE_URL}/${locale}/contact` },
  };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <section className="section section-narrow">
      <h1 className="font-display text-4xl font-bold text-bark-700 mb-2">{t('heading')}</h1>
      <p className="font-body text-bark-500 mb-10">{t('subheading')}</p>

      <div className="space-y-6">
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-1">{t('phone_label')}</p>
          <p className="font-display text-xl font-bold text-bark-700">{t('phone')}</p>
        </div>
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-1">{t('email_label')}</p>
          <p className="font-display text-xl font-bold text-bark-700">{t('email')}</p>
        </div>
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-1">{t('hours_label')}</p>
          <p className="font-body text-bark-600">{t('hours')}</p>
        </div>
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-1">{t('address_label')}</p>
          <p className="font-body text-bark-600">{t('address')}</p>
        </div>
      </div>
    </section>
  );
}
