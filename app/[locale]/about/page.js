import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteUrl';
import { getPageContent } from '@/lib/content';

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
  const locale = await getLocale();
  const c = getPageContent('about', locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-parchment">
        <div className="section max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-3">
              {c.eyebrow}
            </p>
            <h1 className="font-display text-5xl md:text-hero font-bold text-bark-700 mb-5 leading-tight">
              {c.heading}
            </h1>
            <p className="font-body text-lg text-bark-500 max-w-prose leading-relaxed">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-bark-700 mb-5">{c.story_heading}</h2>
            <p className="font-body text-bark-500 leading-relaxed mb-4">{c.story_p1}</p>
            <p className="font-body text-bark-500 leading-relaxed mb-4">{c.story_p2}</p>
            <p className="font-body text-bark-500 leading-relaxed">{c.story_p3}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-bark-700 text-center mb-10">{c.values_heading}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: c.v1_title, body: c.v1_body },
              { title: c.v2_title, body: c.v2_body },
              { title: c.v3_title, body: c.v3_body },
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
          <p className="font-display text-2xl font-bold text-bark-700 mb-6">{c.cta_text}</p>
          <Link href={`/${locale}/shop`} className="btn-primary px-8 py-4 text-base">
            {c.cta_button}
          </Link>
        </div>
      </section>
    </>
  );
}
