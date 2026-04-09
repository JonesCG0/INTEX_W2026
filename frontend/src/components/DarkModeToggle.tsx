import { IconMoon, IconSun } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import { useThemeStore } from '@/store/useThemeStore';

export default function DarkModeToggle({ className = "" }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const dark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
    </Button>
  );
}