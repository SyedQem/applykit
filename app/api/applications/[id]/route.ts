import { NextResponse } from "next/server";
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

export async function GET(_: Request, { params }: Params) {
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
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as ApplicationPatchBody;

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
      status: typeof body.status === "string" ? body.status : undefined,
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
      link: typeof body.link === "string" ? body.link : body.link === null ? null : undefined,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : undefined,
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
}

export async function PUT(request: Request, context: Params) {
  return PATCH(request, context);
}

export async function DELETE(_: Request, { params }: Params) {
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
}
