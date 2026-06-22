'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ShopGrid({ products, initialCategory }) {
  const t = useTranslations('shop');
  const locale = useLocale();
  const [filter, setFilter] = useState(initialCategory);

  const filtered =
    filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'all', label: t('filter_all') },
          { key: 'honey', label: t('filter_honey') },
          { key: 'mead', label: t('filter_mead') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={[
              'font-body font-medium text-sm px-4 py-1.5 rounded-full border transition-all duration-180',
              filter === key
                ? key === 'honey'
                  ? 'bg-honey-100 text-honey-700 border-honey-300'
                  : key === 'mead'
                  ? 'bg-mead-100 text-mead-700 border-mead-300'
                  : 'bg-bark-700 text-cream-50 border-bark-700'
                : 'bg-cream-100 text-bark-600 border-cream-200 hover:border-bark-300',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Product grid ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="font-body text-bark-500 text-center py-16">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} t={t} />
          ))}
        </div>
      )}
    </>
  );
}

function ProductCard({ product, locale, t }) {
  const { addItem } = useCart();
  const isHoney = product.category === 'honey';
  const name = locale === 'bg' ? product.name_bg : product.name_en;
  const description = locale === 'bg' ? product.description_bg : product.description_en;
  const inStock = product.stock_qty > 0;

  function handleAddToCart(e) {
    e.preventDefault();
    addItem(product, locale);
  }

  return (
    <Link href={`/${locale}/shop/${product.id}`} className="card-product block group">
      <div
        className={[
          'card-image-placeholder',
          isHoney ? 'bg-honey-placeholder' : 'bg-mead-placeholder',
        ].join(' ')}
      >
        <div className="w-16 h-16 rounded-full bg-white/30" />
      </div>

      <div className="card-body">
        <span className={isHoney ? 'badge-honey' : 'badge-mead'}>
          {isHoney ? t('filter_honey') : t('filter_mead')}
        </span>
        {product.variant && (
          <p className="font-body text-xs text-stone-400 uppercase tracking-wide -mt-1">
            {product.variant}
          </p>
        )}
        <h3 className="font-display text-lg font-semibold text-bark-700 leading-snug">
          {name}
        </h3>
        {description && (
          <p className="font-body text-sm text-stone-500 line-clamp-2 leading-snug">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-body font-bold text-bark-700 text-lg">
            {Number(product.price_bgn).toFixed(2)}{' '}
            <span className="text-sm font-medium text-stone-500">{t('bgn')}</span>
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={[
              'font-body text-sm font-semibold px-3 py-1.5 rounded-md transition-colors duration-180',
              inStock
                ? isHoney
                  ? 'bg-honey-500 text-white hover:bg-honey-600'
                  : 'bg-mead-500 text-white hover:bg-mead-600'
                : 'bg-cream-200 text-stone-500 cursor-not-allowed',
            ].join(' ')}
          >
            {inStock ? t('add_to_cart') : t('out_of_stock')}
          </button>
        </div>
      </div>
    </Link>
  );
}
