'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function confirmAge(locale, returnTo) {
  const cookieStore = await cookies();
  cookieStore.set('age_verified', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  // Reject absolute URLs and protocol-relative paths to prevent open redirect
  const safePath =
    typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : `/${locale}/shop`;
  redirect(safePath);
}
