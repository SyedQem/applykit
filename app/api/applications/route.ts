import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

async function requireUserId() {
  const auth = await getServerUser();
  return auth?.user.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { ownerId: userId },
    include: { events: true, contact: true },
  });

  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.company || !body.role) {
      return NextResponse.json({ error: "company and role are required" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        ownerId: userId,
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
