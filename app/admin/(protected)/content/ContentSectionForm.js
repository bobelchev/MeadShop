'use client';

import { useActionState } from 'react';
import { updateContent } from './actions';

export default function ContentSectionForm({ namespace, sectionLabel, fields, byShortKey }) {
  const action = updateContent.bind(null, namespace);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        {sectionLabel}
      </h2>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
          Saved.
        </p>
      )}

      <form action={formAction} className="space-y-5">
        {Object.entries(fields).map(([shortKey, { label, type }]) => {
          const row = byShortKey[shortKey];
          const valueBg = row?.value_bg ?? '';
          const valueEn = row?.value_en ?? '';
          const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm';

          return (
            <div key={shortKey}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">BG</label>
                  {type === 'textarea' ? (
                    <textarea
                      name={`${shortKey}__bg`}
                      defaultValue={valueBg}
                      rows={3}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      name={`${shortKey}__bg`}
                      defaultValue={valueBg}
                      className={inputClass}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">EN</label>
                  {type === 'textarea' ? (
                    <textarea
                      name={`${shortKey}__en`}
                      defaultValue={valueEn}
                      rows={3}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      name={`${shortKey}__en`}
                      defaultValue={valueEn}
                      className={inputClass}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? 'Saving…' : `Save ${sectionLabel}`}
          </button>
        </div>
      </form>
    </section>
  );
}
