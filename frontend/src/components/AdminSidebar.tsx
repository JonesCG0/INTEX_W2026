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
  IconMenu2,
  IconLogout 
} from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/lib/AuthContext';
import circleLogo from '@/assets/branding/circle-logo.png';

const navItems = [
  { to: "/", icon: IconHome, label: "Home", exact: true },
  { to: "/admin", icon: IconLayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/residents", icon: IconUsers, label: "Residents" },
  { to: "/admin/donors", icon: IconHeart, label: "Supporters" },
  { to: "/admin/outreach", icon: IconChartBar, label: "Outreach" },
  { to: "/admin/users", icon: IconUserPlus, label: "Users" },
  { to: "/admin/conferences", icon: IconCalendar, label: "Conferences" },
  { to: "/admin/visitations", icon: IconCalendar, label: "Visitations" },
  { to: "/admin/analytics", icon: IconChartBar, label: "Analytics" },
  { to: "/admin/ml-pipelines", icon: IconActivity, label: "ML Pipelines" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (item: any) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const renderNavItems = (compact = false, onNavigate?: () => void) => (
    navItems.map(item => {
      const active = isActive(item);
      return (
        <Link key={item.to} to={item.to} onClick={onNavigate} aria-label={item.label} title={item.label}>
          <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors font-body text-sm ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!compact && <span className="truncate">{item.label}</span>}
          </div>
        </Link>
      );
    })
  );

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/admin" className="inline-flex h-14 items-center gap-3 rounded-full border border-border/80 bg-[#f5e8ce] px-3">
            <img
              src={circleLogo}
              alt=""
              aria-hidden="true"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full"
            />
            <span className="font-display text-[2.1rem] leading-none text-primary">Project Haven</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle className="h-9 w-9" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open admin navigation">
                  <IconMenu2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="font-body text-xl text-primary">Admin Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex h-full flex-col">
                  <nav className="space-y-2">{renderNavItems(false, () => setMobileOpen(false))}</nav>
                  <div className="mt-auto rounded-2xl border border-border bg-card p-4">
                    {user && (
                      <div className="mb-4">
                        <p className="truncate text-sm font-medium">{user.full_name || user.email}</p>
                        <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {user.role || 'Staff'}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 px-0 font-body text-muted-foreground"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                    >
                      <IconLogout className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <aside className={`fixed left-0 top-0 hidden h-screen border-r border-border bg-card md:flex md:flex-col transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-[260px]'}`}>
        <div className="flex h-16 items-center border-b border-border px-4">
          {!collapsed && (
            <Link
              to="/admin"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-border/80 bg-[#f5e8ce] px-3"
              aria-label="Project Haven admin home"
              title="Project Haven admin home"
            >
              <img
                src={circleLogo}
                alt=""
                aria-hidden="true"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full"
              />
              <span className="font-display text-[2.1rem] leading-none text-primary">Project Haven</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={`h-8 w-8 shrink-0 rounded-full ${collapsed ? 'mx-auto' : 'ml-auto'}`}
            aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
            title={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
          >
            {collapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {renderNavItems(collapsed)}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          {!collapsed && user && (
            <div className="rounded-2xl bg-muted/30 px-3 py-2">
              <p className="truncate text-sm font-medium">{user.full_name || user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {user.role || 'Staff'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DarkModeToggle className="h-9 w-9" />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 flex-1 justify-start gap-2 px-2 text-xs text-muted-foreground"
              onClick={() => logout()}
            >
              <IconLogout className="h-4 w-4" />
              {!collapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
