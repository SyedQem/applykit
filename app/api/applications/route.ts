import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const applications = await prisma.application.findMany({ include: { events: true, contact: true } });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.company || !body.role) {
      return NextResponse.json({ error: "company and role are required" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        company: body.company,
        role: body.role,
        status: body.status ?? "APPLIED",
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
        notes: body.notes,
        link: body.link,
        contactId: body.contactId,
        resumeVersionId: body.resumeVersionId,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
