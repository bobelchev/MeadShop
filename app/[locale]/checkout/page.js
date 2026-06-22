import { getTranslations } from 'next-intl/server';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage() {
  const t = await getTranslations('checkout');

  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700 mb-2">
        {t('heading')}
      </h1>
      <p className="font-body text-bark-500 mb-8">{t('subheading')}</p>
      <CheckoutForm />
    </div>
  );
}
