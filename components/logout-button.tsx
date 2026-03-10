"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      className="h-10 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-slate-200 hover:bg-white/10 hover:text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}