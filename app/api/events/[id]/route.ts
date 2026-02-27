import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const event = await prisma.event.update({
    where: { id },
    data: {
      type: body.type,
      eventAt: body.eventAt ? new Date(body.eventAt) : undefined,
      notes: body.notes
    }
  });

  return NextResponse.json(event);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
