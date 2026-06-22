import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/adminSession';
import AdminNav from './AdminNav';

export default async function ProtectedAdminLayout({ children }) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
