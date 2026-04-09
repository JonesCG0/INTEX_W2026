import { Outlet } from 'react-router-dom';
import PublicNav from './PublicNav';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
