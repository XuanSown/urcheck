import { requireAdmin, getCurrentAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const admin = await requireAdmin();
  return <AdminShell user={{ username: admin.username, role: admin.role, email: admin.email ?? undefined }}>{children}</AdminShell>;
}
