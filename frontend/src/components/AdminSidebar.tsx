import { Link, useLocation } from 'react-router-dom';
import { 
  IconHome,
  IconLayoutDashboard, 
  IconUsers, 
  IconHeart, 
  IconChartBar, 
  IconUserPlus,
  IconCalendar,
  IconActivity,
  IconChevronLeft, 
  IconChevronRight, 
  IconLogout 
} from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { to: "/", icon: IconHome, label: "Home", exact: true },
  { to: "/admin", icon: IconLayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/residents", icon: IconUsers, label: "Residents" },
  { to: "/admin/donors", icon: IconHeart, label: "Supporters" },
  { to: "/admin/users", icon: IconUserPlus, label: "Users" },
  { to: "/admin/visitations", icon: IconCalendar, label: "Visitations" },
  { to: "/admin/analytics", icon: IconChartBar, label: "Analytics" },
  { to: "/admin/ml-pipelines", icon: IconActivity, label: "ML Pipelines" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (item: any) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        {!collapsed && (
          <Link to="/admin" className="font-display text-lg text-primary truncate font-bold">
            Project Haven
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={`h-8 w-8 rounded-full shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          {collapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item);
          return (
            <Link key={item.to} to={item.to}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-body text-sm ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {user.role || 'Staff'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <DarkModeToggle className="h-8 w-8" />
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs gap-1 flex-1 justify-start h-8 px-2"
              onClick={() => logout()}
            >
              <IconLogout className="h-3.5 w-3.5" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
