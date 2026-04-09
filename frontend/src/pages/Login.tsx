import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { IconLogin } from "@tabler/icons-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/AuthContext";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUTH_INPUT =
  "bg-background focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const { checkAppState } = useAuth();

  const clearError = () => setErrorMessage(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const response = await apiFetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        skipAuthHandling: true,
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setErrorMessage(
          errorData?.error ?? "Login failed. Please check your credentials."
        );
        return;
      }

      const data = await response.json();
      toast.success(`Welcome back, ${data.displayName}`);

      await checkAppState();

      const destination =
        data.role === "Admin"
          ? "/admin"
          : data.role === "Donor"
            ? "/donor"
            : "/";

      window.location.assign(destination);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <motion.div
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm"
      >
        <div className="mb-6 space-y-2">
          <p className="font-body text-[0.85rem] font-medium uppercase tracking-wider text-muted-foreground">
            Staff &amp; donor sign-in
          </p>
          <h1 className="font-body text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="font-body max-w-sm text-base leading-relaxed text-muted-foreground">
            Sign in to manage safehouse operations or review your donor impact
            data.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {errorMessage ? (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <AuthFormField>
            <Label htmlFor="email" className="text-[0.85rem] font-medium">
              Email address
            </Label>
            <Input
              id="email"
              placeholder="admin@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              required
            />
          </AuthFormField>

          <AuthFormField>
            <Label htmlFor="password" className="text-[0.85rem] font-medium">
              Password
            </Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              required
            />
          </AuthFormField>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-11 w-full font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:h-6 [&_svg]:w-6"
          >
            <IconLogin className="shrink-0" aria-hidden />
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="font-body text-sm text-muted-foreground">
              Donor looking for an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </AuthPageLayout>
  );
}
