import { getTranslations } from 'next-intl/server';
import db from '@/lib/db';
import WholesaleForm from './WholesaleForm';
import { SITE_URL } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

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
  const products = db
    .prepare('SELECT id, name_bg, name_en, category, price_bgn FROM products WHERE active = 1 ORDER BY category, name_bg')
    .all();

  return (
    <section className="section">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-display font-bold text-bark-900 mb-2">{t('heading')}</h1>
        <p className="text-bark-600 mb-8">{t('subheading')}</p>
        <WholesaleForm products={products} />
      </div>
    </section>
  );
}
