'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { EUR_TO_BGN } from '@/lib/price';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="section-narrow flex flex-col items-center text-center gap-6 py-24">
        <h1 className="font-display text-3xl font-bold text-bark-700">{t('heading')}</h1>
        <p className="font-body text-bark-500">{t('empty')}</p>
        <Link href={`/${locale}/shop`} className="btn-primary">
          {t('continue_shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="section max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700 mb-8">
        {t('heading')}
      </h1>

      <ul className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 bg-cream-100 rounded-lg border border-cream-200 p-4"
          >
            <div
              className={[
                'w-16 h-16 rounded-md flex-shrink-0',
                item.category === 'honey' ? 'bg-honey-placeholder' : 'bg-mead-placeholder',
              ].join(' ')}
            />
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-bark-700 truncate">{item.name}</p>
              <p className="font-body text-sm text-stone-500">
                {(Number(item.price_bgn) / EUR_TO_BGN).toFixed(2)} EUR ({Number(item.price_bgn).toFixed(2)} {t('bgn')})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, item.qty - 1)}
                className="w-8 h-8 rounded border border-cream-300 bg-cream-50 text-bark-700 font-semibold hover:bg-cream-200 transition-colors duration-180"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="font-body text-bark-700 w-5 text-center">{item.qty}</span>
              <button
                onClick={() => updateQty(item.id, item.qty + 1)}
                className="w-8 h-8 rounded border border-cream-300 bg-cream-50 text-bark-700 font-semibold hover:bg-cream-200 transition-colors duration-180"
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <p className="font-body font-bold text-bark-700 w-20 text-right">
              {(item.qty * item.price_bgn / EUR_TO_BGN).toFixed(2)} EUR ({(item.qty * item.price_bgn).toFixed(2)} {t('bgn')})
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-stone-400 hover:text-mead-500 font-body text-sm transition-colors duration-180 ml-2"
              aria-label={t('remove')}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-cream-200 pt-6">
        <div>
          <p className="font-body text-stone-500 text-sm">{t('items_count', { count: totalItems })}</p>
          <p className="font-display text-2xl font-bold text-bark-700">
            {t('total')}: {(totalPrice / EUR_TO_BGN).toFixed(2)} EUR ({totalPrice.toFixed(2)} {t('bgn')})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/${locale}/shop`} className="btn-ghost">
            {t('continue_shopping')}
          </Link>
          <Link href={`/${locale}/checkout`} className="btn-primary">
            {t('checkout')}
          </Link>
        </div>
      </div>
    </div>
  );
}
