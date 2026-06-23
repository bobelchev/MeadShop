'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/adminSession';

const NAMESPACES = ['about', 'home'];

export async function updateContent(namespace, prevState, formData) {
  await requireAdmin();
  if (!NAMESPACES.includes(namespace)) return { error: 'Unknown namespace' };

  const entries = [];
  for (const [field, value] of formData.entries()) {
    const bgMatch = field.match(/^(.+)__bg$/);
    if (bgMatch) {
      const shortKey = bgMatch[1];
      entries.push({
        key: `${namespace}.${shortKey}`,
        bg: value,
        en: formData.get(`${shortKey}__en`) ?? '',
      });
    }
  }

  const stmt = db.prepare(
    `INSERT INTO site_content (key, value_bg, value_en) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value_bg = excluded.value_bg, value_en = excluded.value_en`
  );
  db.transaction(() => entries.forEach(e => stmt.run(e.key, e.bg, e.en)))();

  revalidatePath('/bg/about');
  revalidatePath('/en/about');
  revalidatePath('/bg');
  revalidatePath('/en');

  return { success: true };
}
