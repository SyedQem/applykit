import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ApplicationInput = {
  company: string;
  role: string;
  status?: string;
  appliedAt?: Date;
  notes?: string;
  contactId?: string;
  resumeVersionId?: string;
};

type ValidationErrors = Record<string, string[]>;

function addError(errors: ValidationErrors, field: string, message: string) {
  errors[field] = [...(errors[field] ?? []), message];
}

function normalizeOptionalString(
  value: unknown,
  field: string,
  errors: ValidationErrors
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    addError(errors, field, `${field} must be a string`);
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function validateBody(body: unknown):
  | { success: true; data: ApplicationInput }
  | { success: false; errors: ValidationErrors } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      errors: { body: ["Request body must be a JSON object"] },
    };
  }

  const errors: ValidationErrors = {};
  const payload = body as Record<string, unknown>;

  const companyRaw = payload.company;
  let company = "";
  if (typeof companyRaw !== "string") {
    addError(errors, "company", "company is required and must be a string");
  } else {
    company = companyRaw.trim();
    if (!company) {
      addError(errors, "company", "company is required");
    }
  }

  const roleRaw = payload.role;
  let role = "";
  if (typeof roleRaw !== "string") {
    addError(errors, "role", "role is required and must be a string");
  } else {
    role = roleRaw.trim();
    if (!role) {
      addError(errors, "role", "role is required");
    }
  }

  const status = normalizeOptionalString(payload.status, "status", errors);
  const notes = normalizeOptionalString(payload.notes, "notes", errors);
  const contactId = normalizeOptionalString(payload.contactId, "contactId", errors);
  const resumeVersionId = normalizeOptionalString(
    payload.resumeVersionId,
    "resumeVersionId",
    errors
  );

  let appliedAt: Date | undefined;
  if (payload.appliedAt !== undefined && payload.appliedAt !== null) {
    if (typeof payload.appliedAt !== "string") {
      addError(errors, "appliedAt", "appliedAt must be a string date");
    } else {
      const parsed = new Date(payload.appliedAt);
      if (Number.isNaN(parsed.getTime())) {
        addError(errors, "appliedAt", "appliedAt must be a valid date string");
      } else {
        appliedAt = parsed;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      company,
      role,
      status,
      appliedAt,
      notes,
      contactId,
      resumeVersionId,
    },
  };
}

export async function GET() {
  const applications = await prisma.application.findMany({ include: { events: true, contact: true } });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body",
        fieldErrors: { body: ["Body must be valid JSON"] },
      },
      { status: 400 }
    );
  }

  const validation = validateBody(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Invalid application input",
        fieldErrors: validation.errors,
      },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.application.create({
      data: {
        company: validation.data.company,
        role: validation.data.role,
        status: validation.data.status ?? "APPLIED",
        appliedAt: validation.data.appliedAt ?? new Date(),
        notes: validation.data.notes,
        contactId: validation.data.contactId,
        resumeVersionId: validation.data.resumeVersionId,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to create application",
      },
      { status: 500 }
    );
  }
}
