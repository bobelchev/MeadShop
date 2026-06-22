import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { path: '/admin', maxAge: 0 });
  redirect('/admin/login');
}
