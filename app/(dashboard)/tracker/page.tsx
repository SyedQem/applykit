import { prisma } from "@/lib/prisma";
import { NewApplicationDialog } from "@/components/new-application-dialog";
import { ApplicationsTable } from "@/components/applications-table";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Application Tracker</h2>
        <NewApplicationDialog />
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  );
}
