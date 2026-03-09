"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          className="group px-0 text-slate-300 hover:bg-transparent hover:text-white"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </Button>

        <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur sm:block">
          Secure authentication
        </div>
      </div>

      <Card className="w-full border-white/10 bg-white/10 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
        <CardHeader className="space-y-5 pb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200 ring-1 ring-white/10">
            {mode === "signin" ? (
              <LockKeyhole className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-300">
              {mode === "signin"
                ? "Sign in to continue managing applications, interview notes, and follow-ups."
                : "Create an account to start organizing your job search in one place."}
            </CardDescription>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMode("signin")}
              className={
                mode === "signin"
                  ? "bg-white text-slate-950 shadow-sm hover:bg-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMode("signup")}
              className={
                mode === "signup"
                  ? "bg-white text-slate-950 shadow-sm hover:bg-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }
            >
              Sign up
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={mode === "signin" ? "Enter your password" : "Create a password"}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
              />
            </div>

            {!supabase && (
              <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
                Supabase environment variables are missing.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-white text-slate-950 hover:bg-slate-100"
              disabled={isLoading || !supabase}
            >
              {isLoading ? "Please wait..." : submitLabel}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="border-t border-white/10 pt-5 text-xs text-slate-400">
          {mode === "signin" ? (
            <p>
              New here? Switch to <span className="font-medium text-slate-200">Sign up</span> to
              create your account.
            </p>
          ) : (
            <p>
              Already have an account? Switch to{" "}
              <span className="font-medium text-slate-200">Sign in</span>.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}