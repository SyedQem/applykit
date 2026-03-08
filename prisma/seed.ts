import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEVELOPMENT_OWNER_ID = "dev-owner";

async function main() {
  await prisma.event.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.resumeVersion.deleteMany();

  const contact = await prisma.contact.create({
    data: {
      name: "Jane Recruiter",
      email: "jane@acme.com",
      company: "Acme Inc",
      title: "Senior Recruiter"
    }
  });

  const resume = await prisma.resumeVersion.create({
    data: {
      title: "Backend Focused Resume",
      summary: "Highlights API design and distributed systems experience",
      content: "v1"
    }
  });

  const app = await prisma.application.create({
    data: {
      ownerId: DEVELOPMENT_OWNER_ID,
      company: "Acme Inc",
      role: "Software Engineer",
      status: "Interviewing",
      notes: "Need to prepare system design examples",
      contactId: contact.id,
      resumeVersionId: resume.id
    }
  });

  await prisma.event.createMany({
    data: [
      {
        ownerId: DEVELOPMENT_OWNER_ID,
        type: "Applied",
        eventAt: new Date(),
        applicationId: app.id,
        notes: "Applied through careers page"
      },
      {
        ownerId: DEVELOPMENT_OWNER_ID,
        type: "Phone Screen",
        eventAt: new Date(),
        applicationId: app.id,
        notes: "30-minute recruiter screen"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
