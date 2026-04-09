import { Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import DarkModeToggle from "@/components/DarkModeToggle";

type AuthPageLayoutProps = {
  children: React.ReactNode;
};

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <IconArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Back to home</span>
        <span className="sm:hidden">Home</span>
      </Link>

      <div className="absolute right-4 top-4 z-20">
        <DarkModeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-12 pt-16">
        {children}
      </div>
    </div>
  );
}
