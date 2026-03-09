import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return new NextResponse(null, { status: 204 });
  }

  await supabase.auth.signOut();
  return new NextResponse(null, { status: 204 });
}
