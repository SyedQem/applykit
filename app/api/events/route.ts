import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

async function requireUserId() {
  const auth = await getServerUser();
  return auth?.user.id ?? null;
}

function toValidDate(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(value as string | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.applicationId !== "string" || !body.applicationId.trim()) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  if (typeof body.type !== "string" || !body.type.trim()) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  const eventAt = toValidDate(body.eventAt);
  if (body.eventAt && !eventAt) {
    return NextResponse.json({ error: "eventAt must be a valid date" }, { status: 400 });
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
      type: body.type.trim(),
      eventAt: eventAt ?? new Date(),
      notes: typeof body.notes === "string" ? body.notes : null,
      applicationId: body.applicationId,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
