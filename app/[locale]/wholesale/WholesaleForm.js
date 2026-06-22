'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { createWholesaleInquiry } from './actions';

export default function WholesaleForm() {
  const t = useTranslations('wholesale');
  const [state, formAction, pending] = useActionState(createWholesaleInquiry, null);

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-display font-bold text-bark-900 mb-3">{t('success_heading')}</h2>
        <p className="text-bark-700">{t('success_body')}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state?.error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {t(state.error)}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('company_label')} *</label>
        <input name="company_name" type="text" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('contact_label')} *</label>
        <input name="contact_name" type="text" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('phone_label')} *</label>
        <input name="phone" type="tel" required className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('email_label')}</label>
        <input name="email" type="email" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('volume_label')}</label>
        <input name="estimated_volume" type="text" className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-bark-800 mb-1">{t('message_label')}</label>
        <textarea name="message" rows={4} className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-50"
      >
        {pending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
