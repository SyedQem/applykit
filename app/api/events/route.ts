import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

async function requireUserId() {
  const auth = await getServerUser();
  return auth?.user.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { ownerId: userId },
    include: { application: true },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: body.applicationId, ownerId: userId },
    select: { id: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
  }

  const event = await prisma.event.create({
    data: {
      ownerId: userId,
      type: body.type,
      eventAt: body.eventAt ? new Date(body.eventAt) : new Date(),
      notes: body.notes,
      applicationId: body.applicationId,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
