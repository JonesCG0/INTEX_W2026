import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { IconUserPlus } from "@tabler/icons-react";
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

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const { checkAppState } = useAuth();
  const navigate = useNavigate();

  const clearError = () => setErrorMessage(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const response = await apiFetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        skipAuthHandling: true,
        body: JSON.stringify({
          email,
          displayName,
          password,
          confirmPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Welcome, ${data.displayName}. Your donor account is ready.`
        );
        await checkAppState();
        navigate("/donor");
        return;
      }

      const errorData = await response
        .json()
        .catch(() => ({ error: "Registration failed." }));
      setErrorMessage(
        errorData.error ?? "Registration failed. Please try again."
      );
    } catch (error) {
      console.error("Registration error:", error);
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
            Donor registration
          </p>
          <h1 className="font-display text-2xl tracking-tight text-foreground">
            Create a donor account
          </h1>
          <p className="font-body max-w-sm text-base leading-relaxed text-muted-foreground">
            Register to view your donation history and personal impact dashboard.
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
            <Label htmlFor="displayName" className="text-[0.85rem] font-medium">
              Display name
            </Label>
            <Input
              id="displayName"
              placeholder="Project Haven Donor"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              autoComplete="name"
              required
            />
          </AuthFormField>

          <AuthFormField>
            <Label htmlFor="email" className="text-[0.85rem] font-medium">
              Email address
            </Label>
            <Input
              id="email"
              placeholder="donor@example.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              autoComplete="email"
              required
            />
          </AuthFormField>

          <AuthFormField>
            <Label htmlFor="password" className="text-[0.85rem] font-medium">
              Password
            </Label>
            <Input
              id="password"
              placeholder="••••••••••••"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              autoComplete="new-password"
              required
            />
          </AuthFormField>

          <AuthFormField>
            <Label
              htmlFor="confirmPassword"
              className="text-[0.85rem] font-medium"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError();
              }}
              className={AUTH_INPUT}
              autoComplete="new-password"
              required
            />
          </AuthFormField>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-11 w-full font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:h-6 [&_svg]:w-6"
          >
            <IconUserPlus className="shrink-0" aria-hidden />
            {isLoading ? "Creating account…" : "Create account"}
          </Button>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-center font-body text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </AuthPageLayout>
  );
}
