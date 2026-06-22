'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductDetail({ product, locale }) {
  const t = useTranslations('product');
  const tShop = useTranslations('shop');
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const isHoney = product.category === 'honey';
  const name = locale === 'bg' ? product.name_bg : product.name_en;
  const description = locale === 'bg' ? product.description_bg : product.description_en;
  const inStock = product.stock_qty > 0;

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem(product, locale);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="section max-w-5xl mx-auto">
      <Link
        href={`/${locale}/shop`}
        className="font-body text-sm text-honey-700 hover:text-honey-600 mb-8 inline-block"
      >
        {t('back_to_shop')}
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-4">
        {/* Image placeholder */}
        <div
          className={[
            'rounded-xl aspect-square flex items-center justify-center',
            isHoney ? 'bg-honey-placeholder' : 'bg-mead-placeholder',
          ].join(' ')}
        >
          <div className="w-24 h-24 rounded-full bg-white/30" />
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <span className={isHoney ? 'badge-honey' : 'badge-mead'}>
            {isHoney ? tShop('filter_honey') : tShop('filter_mead')}
          </span>
          {product.variant && (
            <p className="font-body text-xs text-stone-400 uppercase tracking-wide">
              {product.variant}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-700">
            {name}
          </h1>
          {description && (
            <p className="font-body text-bark-500 leading-relaxed">{description}</p>
          )}

          <p className="font-body text-2xl font-bold text-bark-700">
            {Number(product.price_bgn).toFixed(2)}{' '}
            <span className="text-base font-medium text-stone-500">{t('bgn')}</span>
          </p>

          <p className={`font-body text-sm ${inStock ? 'text-honey-700' : 'text-stone-400'}`}>
            {inStock ? t('stock_qty', { qty: product.stock_qty }) : t('out_of_stock')}
          </p>

          {inStock && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-md border border-cream-300 bg-cream-100 text-bark-700 font-body font-semibold hover:bg-cream-200 transition-colors duration-180"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="font-body font-semibold text-bark-700 w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))}
                className="w-9 h-9 rounded-md border border-cream-300 bg-cream-100 text-bark-700 font-body font-semibold hover:bg-cream-200 transition-colors duration-180"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={inStock ? (isHoney ? 'btn-primary mt-2' : 'btn-mead mt-2') : 'btn-ghost mt-2 opacity-50 cursor-not-allowed'}
          >
            {added ? t('added') : inStock ? t('add_to_cart') : t('out_of_stock')}
          </button>
        </div>
      </div>
    </div>
  );
}
