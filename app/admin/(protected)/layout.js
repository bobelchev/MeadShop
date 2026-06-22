import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export default async function ProtectedAdminLayout({ children }) {
  const cookieStore = await cookies();
  const expected = crypto
    .createHash('sha256')
    .update(process.env.ADMIN_PASSWORD ?? '')
    .digest('hex');

  if (cookieStore.get('admin_session')?.value !== expected) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
