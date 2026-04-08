import { Outlet, Link, useLocation } from 'react-router-dom';
import { IconHeart, IconChartBar, IconHome, IconLogout } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '@/lib/AuthContext';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - fixed and full height on desktop */}
      <aside className="md:w-64 bg-card border-r border-border flex flex-col fixed md:h-screen w-full h-auto z-40">
        <div className="h-16 flex items-center px-4 border-b border-border">
          <span className="font-display text-lg text-primary">Project Haven</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          <Link to="/donor">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-body ${isActive('/donor') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
              <IconHeart className="h-5 w-5" />
              My Dashboard
            </div>
          </Link>
          <Link to="/impact">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-body ${isActive('/impact') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
              <IconChartBar className="h-5 w-5" />
              Impact
            </div>
          </Link>
          <Link to="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors text-sm font-body">
              <IconHome className="h-5 w-5" />
              Home
            </div>
          </Link>
        </nav>
        <div className="border-t border-border p-3 space-y-2">
          {user && (
            <div className="px-2 py-1.5 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                Donor
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <DarkModeToggle className="h-8 w-8" />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs gap-1"
              onClick={() => logout()}
            >
              <IconLogout className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content, needs padding equal to sidebar width */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
