"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const validatePassword = (password: string) => [
  { label: "At least 8 characters", valid: password.length >= 8 },
  { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
  { label: "One symbol (!@#$...)", valid: /[^A-Za-z0-9]/.test(password) },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [transitioning, setTransitioning] = React.useState(false);
  const [transitionMessage, setTransitionMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn.email({
          email: form.email,
          password: form.password,
        });
        if (res.error) {
          setError(res.error.message ?? "Invalid credentials");
        } else {
          setTransitionMessage("Signing you in...");
          setTransitioning(true);
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1200);
        }
      } else {
        const failed = validatePassword(form.password).find((r) => !r.valid);
        if (failed) {
          setError(failed.label);
          setLoading(false);
          return;
        }
        const res = await signUp.email({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (res.error) {
          setError(res.error.message ?? "Could not create account");
        } else {
          setTransitionMessage("Setting up your space...");
          setTransitioning(true);
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1400);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-satoshi text-3xl font-medium uppercase tracking-widest">
            Better US
          </h1>
          <p className="font-satoshi text-sm uppercase tracking-widest text-muted-foreground">
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-border p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={cn(
                "flex-1 rounded-lg py-2 font-satoshi text-sm font-semibold uppercase tracking-widest transition-all",
                mode === m
                  ? "bg-sidebar-primary text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — signup only */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="font-satoshi text-sm uppercase tracking-widest">
                Full Name
              </Label>
              <Input
                placeholder="Alex Lambert"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="font-satoshi"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-satoshi text-sm uppercase tracking-widest">
              Email
            </Label>
            <Input
              type="email"
              placeholder="alex@email.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              className="font-satoshi"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-satoshi text-sm uppercase tracking-widest">
              Password
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              className="font-satoshi"
            />
            {/* Live password rules — signup only */}
            {mode === "signup" && form.password.length > 0 && (
              <div className="space-y-1 pt-1">
                {validatePassword(form.password).map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${rule.valid ? "bg-green-500" : "bg-muted-foreground"}`}
                    />
                    <span
                      className={`font-satoshi text-sm ${rule.valid ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="font-satoshi tracking-wider text-sm text-destructive font-semibold">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-satoshi uppercase tracking-widest font-semibold rounded-xl"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </div>
      {/* Transition overlay */}
      {transitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            {/* Pulsing logo */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-sidebar-primary/20 animate-ping" />
              <div className="h-12 w-12 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="font-satoshi text-lg font-bold text-white">
                  B
                </span>
              </div>
            </div>
            {/* Message */}
            <div className="flex flex-col items-center gap-2">
              <p className="font-satoshi text-sm font-semibold uppercase tracking-widest text-foreground">
                {transitionMessage}
              </p>
              {/* Animated dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
