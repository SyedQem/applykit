import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  const ctaHref = user ? "/tracker" : "/login";
  const ctaLabel = user ? "Go to app" : "Sign in";

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-3xl border-slate-300/70 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl sm:text-4xl">Track every application in one place</CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base">
            ApplyKit gives you a clear timeline for roles, interviews, and follow-ups so you can stay focused on landing your next job.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/40">
            Organize all roles and statuses.
          </div>
          <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/40">
            Capture notes from every interview.
          </div>
          <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/40">
            Keep momentum with follow-up reminders.
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild size="lg" className="min-w-40">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
