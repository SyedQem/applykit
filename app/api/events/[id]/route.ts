import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

type Params = {
  params: Promise<{ id: string }>;
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
  const event = await prisma.event.findFirst({ where: { id, ownerId: userId } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateResult = await prisma.event.updateMany({
    where: { id, ownerId: userId },
    data: {
      type: body.type,
      eventAt: body.eventAt ? new Date(body.eventAt) : undefined,
      notes: body.notes,
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "Ownership could not be established" }, { status: 403 });
  }

  const event = await prisma.event.findFirst({ where: { id, ownerId: userId } });
  return NextResponse.json(event);
}

export async function DELETE(_: Request, { params }: Params) {
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
}
