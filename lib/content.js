import db from '@/lib/db';
import bgMessages from '@/messages/bg.json';
import enMessages from '@/messages/en.json';

export function getPageContent(namespace, locale) {
  const rows = db.prepare(
    'SELECT key, value_bg, value_en FROM site_content WHERE key LIKE ?'
  ).all(`${namespace}.%`);

  const dbMap = Object.fromEntries(
    rows.map(r => [
      r.key.slice(namespace.length + 1),
      locale === 'en' ? r.value_en : r.value_bg,
    ])
  );

  const fallback = locale === 'en' ? enMessages[namespace] : bgMessages[namespace];
  return { ...fallback, ...dbMap };
}

export function getContentRows(namespace) {
  const rows = db.prepare(
    'SELECT key, value_bg, value_en FROM site_content WHERE key LIKE ? ORDER BY key'
  ).all(`${namespace}.%`);

  const fallback_bg = bgMessages[namespace] ?? {};
  const fallback_en = enMessages[namespace] ?? {};

  const allKeys = Object.keys({ ...fallback_bg, ...fallback_en });
  const dbByKey = Object.fromEntries(rows.map(r => [r.key.slice(namespace.length + 1), r]));

  return allKeys.map(shortKey => ({
    key: `${namespace}.${shortKey}`,
    value_bg: dbByKey[shortKey]?.value_bg ?? fallback_bg[shortKey] ?? '',
    value_en: dbByKey[shortKey]?.value_en ?? fallback_en[shortKey] ?? '',
  }));
}
