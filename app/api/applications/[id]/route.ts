import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { events: true, contact: true }
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(application);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const application = await prisma.application.update({
    where: { id },
    data: {
      company: body.company,
      role: body.role,
      status: body.status,
      notes: body.notes
    }
  });

  return NextResponse.json(application);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  await prisma.application.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
