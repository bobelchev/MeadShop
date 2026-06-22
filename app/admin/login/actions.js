'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { createAdminSession } from '@/lib/adminSession';

// In-memory rate limiter: max 5 attempts per minute per IP
const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count <= 5;
}

export async function login(prevState, formData) {
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return { error: 'Too many attempts. Please wait a minute before trying again.' };
  }

  const password = formData.get('password')?.toString() ?? '';

  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' };
  }

  // Constant-time comparison via SHA-256 digests to prevent timing attacks
  const inputHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(inputHash, expectedHash)) {
    return { error: 'Incorrect password.' };
  }

  const token = createAdminSession();
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/admin',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
  });

  redirect('/admin/orders');
}
