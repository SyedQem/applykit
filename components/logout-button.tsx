"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }

      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? "Logging out..." : "Log out"}
    </Button>
  );
}
