import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

type Params = {
  params: Promise<{ id: string }>;
};

type ApplicationPatchBody = {
  status?: string;
  notes?: string | null;
  link?: string | null;
  appliedAt?: string | Date;
  archived?: boolean;
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
      return NextResponse.json(
        { error: "Invalid relation reference in request data" },
        { status: 400 },
      );
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
    const application = await prisma.application.findFirst({
      where: { id, ownerId: userId },
      include: { events: true, contact: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    return prismaErrorResponse(error, "Failed to fetch application");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let body: ApplicationPatchBody;
    try {
      body = (await request.json()) as ApplicationPatchBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if ("status" in body && (typeof body.status !== "string" || !body.status.trim())) {
      return NextResponse.json({ error: "status must be a non-empty string" }, { status: 400 });
    }

    if ("notes" in body && body.notes !== null && typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes must be a string or null" }, { status: 400 });
    }

    if ("link" in body && body.link !== null && typeof body.link !== "string") {
      return NextResponse.json({ error: "link must be a string or null" }, { status: 400 });
    }

    const parsedAppliedAt = toValidDate(body.appliedAt);
    if (body.appliedAt && !parsedAppliedAt) {
      return NextResponse.json({ error: "appliedAt must be a valid date" }, { status: 400 });
    }

    if ("archived" in body && typeof body.archived !== "boolean") {
      return NextResponse.json({ error: "archived must be a boolean" }, { status: 400 });
    }

    const current = await prisma.application.findFirst({
      where: { id, ownerId: userId },
      select: { status: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const statusChanged =
      typeof body.status === "string" && body.status.trim() && body.status !== current.status;

    const updateResult = await prisma.application.updateMany({
      where: { id, ownerId: userId },
      data: {
        status: typeof body.status === "string" ? body.status.trim() : undefined,
        notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
        link: typeof body.link === "string" ? body.link : body.link === null ? null : undefined,
        appliedAt: parsedAppliedAt ?? undefined,
        archivedAt:
          typeof body.archived === "boolean" ? (body.archived ? new Date() : null) : undefined,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
    }

    if (statusChanged) {
      await prisma.event.create({
        data: {
          ownerId: userId,
          applicationId: id,
          type: `Moved to ${body.status}`,
          eventAt: new Date(),
        },
      });

      const refreshed = await prisma.application.findFirst({
        where: { id, ownerId: userId },
        include: { events: true },
      });

      return NextResponse.json(refreshed);
    }

    const updated = await prisma.application.findFirst({
      where: { id, ownerId: userId },
      include: { events: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return prismaErrorResponse(error, "Failed to update application");
  }
}

export async function PUT(request: Request, context: Params) {
  return PATCH(request, context);
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleteResult = await prisma.application.deleteMany({ where: { id, ownerId: userId } });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return prismaErrorResponse(error, "Failed to delete application");
  }
}
