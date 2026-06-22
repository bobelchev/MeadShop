'use client';

import { useActionState, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/context/CartContext';
import { createOrder } from './actions';
import EcontOfficePicker from '@/components/EcontOfficePicker';
import { EUR_TO_BGN } from '@/lib/price';

const DELIVERY_OPTIONS = [
  { value: 'ekont_office',  key: 'delivery_ekont_office' },
  { value: 'ekont_door',    key: 'delivery_ekont_door' },
  { value: 'speedy_office', key: 'delivery_speedy_office' },
  { value: 'speedy_door',   key: 'delivery_speedy_door' },
];

const inputClass =
  'border border-cream-300 rounded-md px-3 py-2 font-body text-bark-700 bg-cream-50 focus:outline-none focus:border-honey-400 focus:ring-1 focus:ring-honey-400 transition-colors duration-180';

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const { items, totalPrice } = useCart();
  const [state, formAction, isPending] = useActionState(createOrder, null);
  const [delivery, setDelivery] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(null); // { price, currency } | 'loading' | 'error'

  async function handleOfficeSelect(office) {
    if (!office?.cityId) return;
    setDeliveryPrice('loading');
    try {
      const res = await fetch(
        `/api/econt/price?cityId=${office.cityId}&amount=${encodeURIComponent(totalPrice.toFixed(2))}&items=${encodeURIComponent(JSON.stringify(items.map(i => ({ id: i.id, qty: i.qty }))))}`
      );
      const data = await res.json();
      setDeliveryPrice(data.price != null ? data : 'error');
    } catch {
      setDeliveryPrice('error');
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="cart" value={JSON.stringify(items)} />
      <input
        type="hidden"
        name="delivery_price_eur"
        value={
          deliveryPrice && deliveryPrice !== 'loading' && deliveryPrice !== 'error'
            ? String(deliveryPrice.price)
            : ''
        }
      />

      {state?.error && (
        <div className="bg-mead-100 border border-mead-300 text-mead-700 rounded-md px-4 py-3 font-body text-sm">
          {t(state.error)}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_name" className="font-body font-medium text-bark-700 text-sm">
          {t('name_label')} <span className="text-mead-500">*</span>
        </label>
        <input
          id="customer_name"
          name="customer_name"
          type="text"
          required
          placeholder={t('name_placeholder')}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="font-body font-medium text-bark-700 text-sm">
          {t('phone_label')} <span className="text-mead-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder={t('phone_placeholder')}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-body font-medium text-bark-700 text-sm">
          {t('email_label')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={t('email_placeholder')}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="delivery_method" className="font-body font-medium text-bark-700 text-sm">
          {t('delivery_label')} <span className="text-mead-500">*</span>
        </label>
        <select
          id="delivery_method"
          name="delivery_method"
          required
          value={delivery}
          onChange={e => setDelivery(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {t('delivery_label')}
          </option>
          {DELIVERY_OPTIONS.map(({ value, key }) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>
      </div>

      {delivery === 'ekont_office' ? (
        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-bark-700 text-sm">
            {t('office_label')} <span className="text-mead-500">*</span>
          </label>
          <EcontOfficePicker inputClass={inputClass} onSelect={handleOfficeSelect} />
          {deliveryPrice === 'loading' && (
            <p className="font-body text-xs text-stone-400">{t('delivery_price_loading')}</p>
          )}
          {deliveryPrice === 'error' && (
            <p className="font-body text-xs text-stone-400">{t('delivery_price_unavailable')}</p>
          )}
          {deliveryPrice && deliveryPrice !== 'loading' && deliveryPrice !== 'error' && (
            <p className="font-body text-xs text-honey-700">
              {t('delivery_price_label')}: {deliveryPrice.price.toFixed(2)} EUR ({(deliveryPrice.price * EUR_TO_BGN).toFixed(2)} {t('bgn')})
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address_or_office" className="font-body font-medium text-bark-700 text-sm">
              {t('address_label')} <span className="text-mead-500">*</span>
            </label>
            <input
              id="address_or_office"
              name="address_or_office"
              type="text"
              required
              placeholder={t('address_placeholder')}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="font-body font-medium text-bark-700 text-sm">
              {t('city_label')} <span className="text-mead-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              placeholder={t('city_placeholder')}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="font-body font-medium text-bark-700 text-sm">
          {t('notes_label')}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder={t('notes_placeholder')}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="bg-honey-50 border border-honey-200 rounded-md px-4 py-3 font-body text-sm text-honey-700">
        {t('cod_notice')}
      </div>

      <div className="border-t border-cream-200 pt-4">
        {deliveryPrice && deliveryPrice !== 'loading' && deliveryPrice !== 'error' ? (
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm text-bark-500">
              {t('products_subtotal')}: {(totalPrice / EUR_TO_BGN).toFixed(2)} EUR ({totalPrice.toFixed(2)} {t('bgn')})
            </p>
            <p className="font-body text-sm text-bark-500">
              {t('delivery_price_label')}: {deliveryPrice.price.toFixed(2)} EUR ({(deliveryPrice.price * EUR_TO_BGN).toFixed(2)} {t('bgn')})
            </p>
            <p className="font-display text-xl font-bold text-bark-700 mt-1">
              {t('total')}: {(totalPrice / EUR_TO_BGN + deliveryPrice.price).toFixed(2)} EUR ({(totalPrice + deliveryPrice.price * EUR_TO_BGN).toFixed(2)} {t('bgn')})
            </p>
          </div>
        ) : (
          <p className="font-display text-xl font-bold text-bark-700">
            {t('total')}: {(totalPrice / EUR_TO_BGN).toFixed(2)} EUR ({totalPrice.toFixed(2)} {t('bgn')})
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || items.length === 0}
        className="btn-primary w-full text-base py-4"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
