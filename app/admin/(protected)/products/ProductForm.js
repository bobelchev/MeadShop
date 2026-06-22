'use client';

import { useActionState, useState } from 'react';

export default function ProductForm({ action, initialValues = {}, initialImages = [], title }) {
  const [state, formAction, pending] = useActionState(action, null);
  const [images, setImages] = useState(initialImages.map((i) => i.image_path));

  function removeImage(path) {
    setImages((imgs) => imgs.filter((p) => p !== path));
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
          Saved.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name (BG)</label>
          <input name="name_bg" defaultValue={initialValues.name_bg ?? ''} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
          <input name="name_en" defaultValue={initialValues.name_en ?? ''} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" defaultValue={initialValues.category ?? 'honey'}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="honey">honey</option>
            <option value="mead">mead</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
          <input name="variant" defaultValue={initialValues.variant ?? ''} placeholder="700г"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (BGN)</label>
          <input name="price_bgn" type="number" step="0.01" min="0.01"
            defaultValue={initialValues.price_bgn ?? ''} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock qty</label>
        <input name="stock_qty" type="number" min="0"
          defaultValue={initialValues.stock_qty ?? 0} required
          className="w-32 border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (BG)</label>
        <textarea name="description_bg" rows={3} defaultValue={initialValues.description_bg ?? ''}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
        <textarea name="description_en" rows={3} defaultValue={initialValues.description_en ?? ''}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      {/* Image management */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((imgPath) => (
              <div key={imgPath} className="relative w-24 h-24 rounded border border-gray-200 overflow-hidden bg-gray-50">
                {/* hidden input keeps this path in the submitted form */}
                <input type="hidden" name="keptImages" value={imgPath} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgPath} alt="" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => removeImage(imgPath)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold leading-none flex items-center justify-center"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          name="newImages"
          multiple
          accept="image/*"
          className="block text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
        />
        <p className="text-xs text-gray-400 mt-1">Select one or more image files to upload.</p>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="active" id="active"
          defaultChecked={initialValues.active === undefined ? true : Boolean(initialValues.active)} />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active (visible in shop)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending}
          className="bg-gray-800 text-white rounded px-4 py-2 text-sm hover:bg-gray-700 disabled:opacity-50">
          {pending ? 'Saving…' : 'Save'}
        </button>
        <a href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">
          Cancel
        </a>
      </div>
    </form>
  );
}
