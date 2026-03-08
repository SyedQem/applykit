import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/get-server-user";

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
        { error: "Invalid relation reference (contactId or resumeVersionId)" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
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

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.company !== "string" || !body.company.trim()) {
      return NextResponse.json({ error: "company is required" }, { status: 400 });
    }

    if (typeof body.role !== "string" || !body.role.trim()) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    if ("status" in body && typeof body.status !== "string") {
      return NextResponse.json({ error: "status must be a string" }, { status: 400 });
    }

    const appliedAt = toValidDate(body.appliedAt);
    if (body.appliedAt && !appliedAt) {
      return NextResponse.json({ error: "appliedAt must be a valid date" }, { status: 400 });
    }

    if ("notes" in body && body.notes !== null && typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes must be a string or null" }, { status: 400 });
    }

    if ("link" in body && body.link !== null && typeof body.link !== "string") {
      return NextResponse.json({ error: "link must be a string or null" }, { status: 400 });
    }

    if ("contactId" in body && body.contactId !== null && typeof body.contactId !== "string") {
      return NextResponse.json({ error: "contactId must be a string or null" }, { status: 400 });
    }

    if (
      "resumeVersionId" in body &&
      body.resumeVersionId !== null &&
      typeof body.resumeVersionId !== "string"
    ) {
      return NextResponse.json(
        { error: "resumeVersionId must be a string or null" },
        { status: 400 },
      );
    }

    const application = await prisma.application.create({
      data: {
        ownerId: userId,
        company: body.company.trim(),
        role: body.role.trim(),
        status: typeof body.status === "string" ? body.status : "APPLIED",
        appliedAt: appliedAt ?? new Date(),
        notes: typeof body.notes === "string" ? body.notes : null,
        link: typeof body.link === "string" ? body.link : null,
        contactId: typeof body.contactId === "string" ? body.contactId : null,
        resumeVersionId: typeof body.resumeVersionId === "string" ? body.resumeVersionId : null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return prismaErrorResponse(error, "Failed to create application");
  }
}
