import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

type Params = {
  params: Promise<{ id: string }>;
};

async function requireUserId() {
  const auth = await getServerUser();
  return auth?.user.id ?? null;
}

function toValidDate(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(value as string | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function prismaErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid relation reference" }, { status: 400 });
    }
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function GET(_: Request, { params }: Params) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findFirst({ where: { id, ownerId: userId } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    return prismaErrorResponse(error, "Failed to fetch event");
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if ("type" in body && (typeof body.type !== "string" || !body.type.trim())) {
      return NextResponse.json({ error: "type must be a non-empty string" }, { status: 400 });
    }

    const parsedEventAt = toValidDate(body.eventAt);
    if (body.eventAt && !parsedEventAt) {
      return NextResponse.json({ error: "eventAt must be a valid date" }, { status: 400 });
    }

    const updateResult = await prisma.event.updateMany({
      where: { id, ownerId: userId },
      data: {
        type: typeof body.type === "string" ? body.type.trim() : undefined,
        eventAt: parsedEventAt ?? undefined,
        notes: typeof body.notes === "string" ? body.notes : undefined,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
    }

    const event = await prisma.event.findFirst({ where: { id, ownerId: userId } });
    return NextResponse.json(event);
  } catch (error) {
    return prismaErrorResponse(error, "Failed to update event");
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleteResult = await prisma.event.deleteMany({ where: { id, ownerId: userId } });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return prismaErrorResponse(error, "Failed to delete event");
  }
}
