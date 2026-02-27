import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({ include: { application: true } });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const event = await prisma.event.create({
    data: {
      type: body.type,
      eventAt: body.eventAt ? new Date(body.eventAt) : new Date(),
      notes: body.notes,
      applicationId: body.applicationId
    }
  });

  return NextResponse.json(event, { status: 201 });
}
