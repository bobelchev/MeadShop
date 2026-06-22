import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { destroyAdminSession } from '@/lib/adminSession';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  destroyAdminSession(token);
  cookieStore.set('admin_session', '', { path: '/admin', maxAge: 0 });
  redirect('/admin/login');
}
