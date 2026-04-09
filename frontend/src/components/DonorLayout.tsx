import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { IconChartBar, IconHeart, IconHome, IconLogout, IconMenu2 } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/lib/AuthContext';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = (
    <>
      <Link to="/donor" onClick={() => setMobileOpen(false)}>
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-sm font-body ${isActive('/donor') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
          <IconHeart className="h-5 w-5" />
          My Dashboard
        </div>
      </Link>
      <Link to="/impact" onClick={() => setMobileOpen(false)}>
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-sm font-body ${isActive('/impact') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
          <IconChartBar className="h-5 w-5" />
          Impact
        </div>
      </Link>
      <Link to="/" onClick={() => setMobileOpen(false)}>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:bg-accent transition-colors text-sm font-body">
          <IconHome className="h-5 w-5" />
          Home
        </div>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/donor" className="font-display text-lg text-primary">Project Haven</Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle className="h-9 w-9" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open donor navigation">
                  <IconMenu2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="font-body text-xl text-primary">Donor Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex h-full flex-col">
                  <nav className="space-y-2">{navLinks}</nav>
                  <div className="mt-auto rounded-2xl border border-border bg-card p-4">
                    {user && (
                      <div className="mb-4">
                        <p className="truncate text-sm font-medium">{user.full_name || user.email}</p>
                        <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Donor
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

      <aside className="fixed left-0 top-0 hidden h-screen w-[260px] flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <span className="font-display text-lg text-primary">Project Haven</span>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-5">{navLinks}</nav>
        <div className="space-y-3 border-t border-border p-4">
          {user && (
            <div className="rounded-2xl bg-muted/30 px-3 py-2 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
              <span className="inline-block mt-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                Donor
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DarkModeToggle className="h-9 w-9" />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 flex-1 justify-start gap-2 text-xs text-muted-foreground"
              onClick={() => logout()}
            >
              <IconLogout className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-6 md:ml-[260px] md:p-8">
        <div className="max-w-[1280px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
