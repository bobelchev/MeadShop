import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: t('meta_title'), description: t('meta_description') };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <div className="section-narrow flex flex-col gap-8 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700">{t('heading')}</h1>

      <Section title={t('controller_heading')}>
        <p>{t('controller_body')}</p>
      </Section>

      <Section title={t('data_collected_heading')}>
        <p>{t('data_collected_body')}</p>
      </Section>

      <Section title={t('lawful_basis_heading')}>
        <p>{t('lawful_basis_body')}</p>
      </Section>

      <Section title={t('recipients_heading')}>
        <p>{t('recipients_body')}</p>
      </Section>

      <Section title={t('retention_heading')}>
        <p>{t('retention_body')}</p>
      </Section>

      <Section title={t('rights_heading')}>
        <p>{t('rights_body')}</p>
      </Section>

      <Section title={t('cookies_heading')}>
        <p>{t('cookies_body')}</p>
      </Section>

      <Section title={t('contact_heading')}>
        <p>{t('contact_body')}</p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-xl font-bold text-bark-700">{title}</h2>
      <div className="font-body text-bark-500 leading-relaxed">{children}</div>
    </div>
  );
}
