'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { EUR_TO_BGN } from '@/lib/price';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getLocalizedField } from '@/lib/i18n';

export default function ProductDetail({ product, locale, images = [] }) {
  const t = useTranslations('product');
  const tShop = useTranslations('shop');
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const isHoney = product.category === 'honey';
  const name = getLocalizedField(product, 'name', locale);
  const description = getLocalizedField(product, 'description', locale);
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
        {/* Product image / slideshow */}
        {images.length > 0 ? (
          <div className="relative rounded-xl aspect-square overflow-hidden bg-cream-100">
            <Image
              src={images[imgIdx].image_path}
              alt={name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow text-bark-700 flex items-center justify-center text-lg leading-none"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow text-bark-700 flex items-center justify-center text-lg leading-none"
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-honey-600' : 'bg-white/60 hover:bg-white/90'}`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className={[
              'rounded-xl aspect-square flex items-center justify-center',
              isHoney ? 'bg-honey-placeholder' : 'bg-mead-placeholder',
            ].join(' ')}
          >
            <div className="w-24 h-24 rounded-full bg-white/30" />
          </div>
        )}

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
            {(Number(product.price_bgn) / EUR_TO_BGN).toFixed(2)} EUR{' '}
            <span className="text-base font-medium text-stone-500">({Number(product.price_bgn).toFixed(2)} {t('bgn')})</span>
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
