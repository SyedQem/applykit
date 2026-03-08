import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { getServerUser } from "@/lib/supabase/get-server-user";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const auth = await getServerUser();
  if (!auth) {
    redirect("/login");
  }

  const resumeVersions = await prisma.resumeVersion.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Resume Versions</h2>
      <div className="space-y-3">
        {resumeVersions.map((resume) => (
          <Card key={resume.id}>
            <p className="font-semibold">{resume.title}</p>
            <p className="text-sm text-slate-600">{resume.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
