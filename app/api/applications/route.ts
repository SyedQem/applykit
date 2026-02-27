import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const applications = await prisma.application.findMany({ include: { events: true, contact: true } });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const application = await prisma.application.create({
    data: {
      company: body.company,
      role: body.role,
      status: body.status ?? "Applied",
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
      notes: body.notes,
      contactId: body.contactId,
      resumeVersionId: body.resumeVersionId
    }
  });

  return NextResponse.json(application, { status: 201 });
}
