'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export async function login(prevState, formData) {
  const password = formData.get('password')?.toString() ?? '';

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' };
  }

  const hash = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex');
  const cookieStore = await cookies();
  cookieStore.set('admin_session', hash, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/admin',
  });

  redirect('/admin/orders');
}
