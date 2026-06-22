import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import db from '@/lib/db';
import CartClearer from './CartClearer';

const DELIVERY_KEY_MAP = {
  ekont_office:  'delivery_ekont_office',
  ekont_door:    'delivery_ekont_door',
  speedy_office: 'delivery_speedy_office',
  speedy_door:   'delivery_speedy_door',
};

export default async function OrderConfirmationPage({ searchParams }) {
  const t = await getTranslations('order_confirmation');
  const locale = await getLocale();
  const params = await searchParams;
  const token = params?.token?.toString();

  if (!token) notFound();

  const order = db.prepare('SELECT * FROM orders WHERE confirmation_token = ?').get(token);
  if (!order) notFound();

  const deliveryKey = DELIVERY_KEY_MAP[order.delivery_method] ?? 'delivery_ekont_office';

  return (
    <div className="section-narrow flex flex-col gap-8">
      <CartClearer />

      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-honey-100 border border-honey-200 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M6 14l6 6L22 8"
              stroke="#8A5A04"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700 mb-3">
          {t('heading')}
        </h1>
        <p className="font-body text-bark-500 leading-relaxed">
          {t('body', { id: order.id })}
        </p>
      </div>

      <div className="bg-cream-100 rounded-xl border border-cream-200 p-6 flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-bark-700 mb-2">
          {t('summary_heading')}
        </h2>
        <SummaryRow label={t('name')} value={order.customer_name} />
        <SummaryRow label={t('phone')} value={order.phone} />
        <SummaryRow label={t('delivery')} value={t(deliveryKey)} />
        <SummaryRow label={t('address')} value={order.address_or_office} />
        <SummaryRow label={t('city')} value={order.city} />
        <div className="border-t border-cream-200 pt-3 mt-1">
          <SummaryRow
            label={t('total')}
            value={`${Number(order.total_amount).toFixed(2)} ${t('bgn')}`}
            bold
          />
        </div>
      </div>

      <div className="text-center">
        <Link href={`/${locale}`} className="btn-primary">
          {t('continue')}
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }) {
  return (
    <div className="flex justify-between gap-4 font-body text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`text-bark-700 text-right ${bold ? 'font-bold text-base' : ''}`}>
        {value}
      </span>
    </div>
  );
}
