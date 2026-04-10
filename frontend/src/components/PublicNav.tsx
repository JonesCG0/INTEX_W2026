import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IconHeart, IconLogin, IconLogout, IconMenu2 } from '@tabler/icons-react';
import { useAuth } from '@/lib/AuthContext';
import circleLogo from '@/assets/branding/circle-logo.png';

export default function PublicNav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keep the public links small and easy to scan.
  const links = [
    { to: "/", label: "Home" },
    { to: "/impact", label: "Impact" },
  ];

  // Send users to the donate section on the home page when possible.
  const donateHref = location.pathname === "/" ? "#donate" : "/#donate";
  const dashboardHref = user?.role === 'Admin' ? '/admin' : '/donor';

  const navLinkClass = (isActive: boolean) =>
    `font-body text-sm transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="inline-flex h-14 items-center gap-3 rounded-full border border-border/80 bg-[#f5e8ce] px-3">
            <img
              src={circleLogo}
              alt=""
              aria-hidden="true"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full"
            />
            <span className="font-display text-[2.1rem] leading-none text-primary">Project Haven</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-body text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Native youth safehouse network
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link key={link.to} to={link.to} className={navLinkClass(location.pathname === link.to)}>
              {link.label}
            </Link>
          ))}
          <a href={donateHref} className="inline-flex items-center gap-2 font-body text-sm text-secondary transition-colors hover:text-secondary/80">
            <IconHeart className="h-4 w-4" />
            Donate
          </a>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user ? (
            <>
              <Link to={dashboardHref}>
                <Button size="sm" variant="outline" className="hidden font-body gap-2 sm:inline-flex">
                  <IconLogin className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="hidden font-body gap-2 text-muted-foreground sm:inline-flex" onClick={() => logout()}>
                <IconLogout className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button size="sm" variant="outline" className="font-body gap-2">
                <IconLogin className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open site navigation">
                <IconMenu2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <div className="inline-flex h-14 items-center gap-3 rounded-full border border-border/80 bg-[#f5e8ce] px-3">
                    <img
                      src={circleLogo}
                      alt=""
                      aria-hidden="true"
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full"
                    />
                    <span className="font-display text-[2.1rem] leading-none text-primary">Project Haven</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  {links.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={navLinkClass(location.pathname === link.to)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <a
                    href={donateHref}
                    className="flex items-center gap-2 font-body text-sm text-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconHeart className="h-4 w-4" />
                    Donate
                  </a>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="font-body text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Built for culturally grounded care and transparent stewardship
                  </p>
                </div>

                <div className="space-y-3">
                  {user ? (
                    <>
                      <Link to={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                        <Button size="sm" variant="outline" className="w-full font-body gap-2">
                          <IconLogin className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full font-body gap-2 text-muted-foreground"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        <IconLogout className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full font-body gap-2">
                        <IconLogin className="h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
