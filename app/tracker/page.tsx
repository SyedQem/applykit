import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Application Tracker</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id}>
            <h3 className="font-semibold">{app.role} @ {app.company}</h3>
            <p className="text-sm text-slate-600">Status: {app.status}</p>
            <p className="text-sm text-slate-600">Events: {app.events.length}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
