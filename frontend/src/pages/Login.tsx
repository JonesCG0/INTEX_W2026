"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/aceternity/Label";
import { Input } from "@/components/ui/aceternity/Input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api-base";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { checkAppState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiFetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        skipAuthHandling: true,
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Welcome back, ${data.displayName}`);

        await checkAppState();

        if (data.role === 'Admin') {
          navigate("/admin");
        } else {
          navigate("/donor");
        }
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#efe2cf] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(188,145,93,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(101,67,33,0.18),_transparent_30%)]" />
      <div className="absolute inset-y-0 left-0 w-20 bg-[linear-gradient(180deg,_rgba(129,88,47,0.14),_rgba(208,182,141,0.06))]" />
      <div className="absolute inset-y-0 right-0 w-24 bg-[linear-gradient(180deg,_rgba(90,58,31,0.18),_rgba(207,180,137,0.08))]" />
      <div className="absolute left-6 top-10 h-32 w-32 rounded-full bg-[#cba97a]/20 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-[#7b5634]/15 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-[#c9b08e] bg-[#fffaf3]/95 p-5 shadow-[0_24px_80px_rgba(71,47,25,0.16)] backdrop-blur md:p-8"
        >
          <div className="mb-6 space-y-2">
            <p className="font-body text-[11px] uppercase tracking-[0.32em] text-[#8d6a47]">
              Project Haven Access
            </p>
            <h2 className="font-display text-xl text-[#4f341d] md:text-2xl">
              Welcome back
            </h2>
            <p className="max-w-sm text-sm text-[#735740] font-body">
              Sign in to manage safehouse operations or review your donor impact data.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </LabelInputContainer>

            <button
              className="relative block h-11 w-full rounded-md bg-gradient-to-r from-[#7c5735] via-[#a77b4a] to-[#c9a372] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(114,79,45,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login →"}
              <BottomGradient />
            </button>

            <div className="rounded-xl border border-[#d8c3a5] bg-[#f6ecdf] px-4 py-3">
              <p className="text-sm text-[#735740] font-body">
                Donor looking for an account?{" "}
                <Link to="/signup" className="font-semibold text-[#8d5b2e] hover:underline">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px bg-gradient-to-r from-transparent via-[#f4ddbd] to-transparent opacity-80" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 blur-sm bg-gradient-to-r from-transparent via-[#fff1de] to-transparent opacity-70" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
