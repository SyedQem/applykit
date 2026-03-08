"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLabel = mode === "signin" ? "Sign in" : "Create account";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("Authentication is not configured yet. Add Supabase env vars to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }
      }

      router.push("/tracker");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full border-slate-200/70 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur">
      <CardHeader className="space-y-3">
        <CardTitle>Welcome to ApplyKit</CardTitle>
        <CardDescription>
          Sign in or create your account to continue to your tracker.
        </CardDescription>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "ghost"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "ghost"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {!supabase && (
            <p className="text-sm text-amber-600 dark:text-amber-300">
              Supabase environment variables are missing.
            </p>
          )}
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || !supabase}>
            {isLoading ? "Please wait..." : submitLabel}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-slate-500 dark:text-slate-400">
        {mode === "signin"
          ? "Need an account? Switch to sign up."
          : "Already have an account? Switch to sign in."}
      </CardFooter>
    </Card>
  );
}
