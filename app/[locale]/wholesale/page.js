import { getTranslations } from 'next-intl/server';
import WholesaleForm from './WholesaleForm';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meadshop.bg';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wholesale' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: `${SITE_URL}/${locale}/wholesale` },
  };
}

export default async function WholesalePage() {
  const t = await getTranslations('wholesale');
  return (
    <section className="section section-narrow">
      <h1 className="text-3xl font-display font-bold text-bark-900 mb-2">{t('heading')}</h1>
      <p className="text-bark-600 mb-8">{t('subheading')}</p>
      <WholesaleForm />
    </section>
  );
}
