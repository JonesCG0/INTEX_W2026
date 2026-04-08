import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';
import { IconLogin, IconHeart, IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/lib/AuthContext';

export default function PublicNav() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/impact", label: "Impact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl text-primary">Project Haven</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
                className="font-body"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" className="font-body text-secondary" asChild>
            <a href="#donate">
              <IconHeart className="h-4 w-4 mr-1" />
              Donate
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user ? (
            <>
              <Link to={user.role === 'Admin' ? '/admin' : '/donor'}>
                <Button size="sm" variant="outline" className="font-body gap-2">
                  <IconLogin className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="font-body gap-2 text-muted-foreground" onClick={() => logout()}>
                <IconLogout className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline" className="font-body gap-2">
                <IconLogin className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
