'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function confirmAge(locale, returnTo) {
  const cookieStore = await cookies();
  cookieStore.set('age_verified', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // No maxAge — session-scoped, cleared when browser closes
  });
  redirect(returnTo || `/${locale}/shop`);
}
