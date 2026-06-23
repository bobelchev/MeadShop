import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { SITE_URL } from '@/lib/siteUrl';
import { getPageContent } from '@/lib/content';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: `${SITE_URL}/${locale}` },
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const c = getPageContent('home', locale);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-hero-parchment">
        <div className="section max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-honey-600 mb-3">
              {c.hero_eyebrow}
            </p>
            <h1 className="font-display text-5xl md:text-hero font-bold text-bark-700 mb-5 leading-tight">
              {c.hero_heading}
            </h1>
            <p className="font-body text-lg text-bark-500 mb-8 max-w-prose">
              {c.hero_body}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/shop`} className="btn-primary px-8 py-4 text-base">
                {c.hero_cta_shop}
              </Link>
              <Link href={`/${locale}/about`} className="btn-ghost px-8 py-4 text-base">
                {c.hero_cta_about}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-bark-700 text-center mb-10">
            {c.categories_heading}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Honey */}
            <div className="rounded-xl overflow-hidden border border-cream-200 shadow-card hover:shadow-card-hover transition-shadow duration-250">
              <div className="bg-honey-placeholder h-56" />
              <div className="p-6">
                <span className="badge-honey">{c.honey_label}</span>
                <h3 className="font-display text-2xl font-bold text-bark-700 mt-3 mb-2">
                  {c.honey_title}
                </h3>
                <p className="font-body text-bark-500 mb-5 leading-relaxed">
                  {c.honey_body}
                </p>
                <Link href={`/${locale}/shop?category=honey`} className="btn-primary">
                  {c.honey_cta}
                </Link>
              </div>
            </div>

            {/* Mead */}
            <div className="rounded-xl overflow-hidden border border-cream-200 shadow-card hover:shadow-card-hover transition-shadow duration-250">
              <div className="bg-mead-placeholder h-56" />
              <div className="p-6">
                <span className="badge-mead">{c.mead_label}</span>
                <h3 className="font-display text-2xl font-bold text-bark-700 mt-3 mb-2">
                  {c.mead_title}
                </h3>
                <p className="font-body text-bark-500 mb-5 leading-relaxed">
                  {c.mead_body}
                </p>
                <Link href={`/${locale}/shop?category=mead`} className="btn-mead">
                  {c.mead_cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────────────────────── */}
      <section className="bg-cream-100 border-t border-b border-cream-200">
        <div className="section max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-bark-700 text-center mb-10">
            {c.values_heading}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard title={c.value_natural_title} body={c.value_natural_body} />
            <ValueCard title={c.value_local_title} body={c.value_local_body} />
            <ValueCard title={c.value_craft_title} body={c.value_craft_body} />
          </div>
        </div>
      </section>

      {/* ── Story teaser ───────────────────────────────────────────────── */}
      <section className="bg-mead-panel">
        <div className="section max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-50 mb-4">
            {c.story_heading}
          </h2>
          <p className="font-body text-lg text-cream-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {c.story_body}
          </p>
          <Link href={`/${locale}/about`} className="btn-ghost-inverted">
            {c.story_cta}
          </Link>
        </div>
      </section>
    </>
  );
}

function ValueCard({ title, body }) {
  return (
    <div className="bg-cream-50 rounded-lg p-6 border border-cream-200 shadow-card">
      <div className="w-10 h-10 rounded-full bg-honey-100 border border-honey-200 mb-4 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1l1.854 4.146L14 6l-4.146 1.854L8 12l-1.854-4.146L2 6l4.146-1.854z"
            fill="#8A5A04"
          />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-bark-700 mb-2">{title}</h3>
      <p className="font-body text-sm text-bark-500 leading-relaxed">{body}</p>
    </div>
  );
}
