import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteUrl';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: `${SITE_URL}/${locale}/about` },
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  const locale = await getLocale();

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-parchment">
        <div className="section max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-3">
              {t('eyebrow')}
            </p>
            <h1 className="font-display text-5xl md:text-hero font-bold text-bark-700 mb-5 leading-tight">
              {t('heading')}
            </h1>
            <p className="font-body text-lg text-bark-500 max-w-prose leading-relaxed">
              {t('intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-bark-700 mb-5">{t('story_heading')}</h2>
            <p className="font-body text-bark-500 leading-relaxed mb-4">{t('story_p1')}</p>
            <p className="font-body text-bark-500 leading-relaxed mb-4">{t('story_p2')}</p>
            <p className="font-body text-bark-500 leading-relaxed">{t('story_p3')}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-bark-700 text-center mb-10">{t('values_heading')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: t('v1_title'), body: t('v1_body') },
              { title: t('v2_title'), body: t('v2_body') },
              { title: t('v3_title'), body: t('v3_body') },
            ].map(({ title, body }) => (
              <div key={title} className="bg-cream-50 rounded-xl p-6 border border-cream-200 shadow-card">
                <h3 className="font-display text-xl font-bold text-bark-700 mb-3">{title}</h3>
                <p className="font-body text-bark-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="max-w-7xl mx-auto text-center">
          <hr className="ornament-rule mb-8" />
          <p className="font-display text-2xl font-bold text-bark-700 mb-6">{t('cta_text')}</p>
          <Link href={`/${locale}/shop`} className="btn-primary px-8 py-4 text-base">
            {t('cta_button')}
          </Link>
        </div>
      </section>
    </>
  );
}
