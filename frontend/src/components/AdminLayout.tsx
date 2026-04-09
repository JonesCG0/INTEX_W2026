import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-h-screen pt-4 transition-all duration-300 md:ml-[260px] md:pt-0">
        <div className="max-w-[1280px] p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}