import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { NewApplicationForm } from "@/components/new-application-form";

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Application Tracker</h2>
        <NewApplicationForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="pt-6 space-y-1">
              <h3 className="font-semibold">
                {app.role} @ {app.company}
              </h3>
              <p className="text-sm text-slate-600">Status: {app.status}</p>
              <p className="text-sm text-slate-600">Events: {app.events.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}