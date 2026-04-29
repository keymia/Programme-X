import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? ""
  })
});

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@blackmedcollective.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeThisNow123!";
  const passwordHash = await bcrypt.hash(password, 12);
  const demoDomain = "demo.appli.local";

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" }
  });

  await prisma.mentorApplication.deleteMany({
    where: { email: { endsWith: `@${demoDomain}` } }
  });

  await prisma.menteeApplication.deleteMany({
    where: { email: { endsWith: `@${demoDomain}` } }
  });

  const mentorSeed = [
    {
      fullName: "Amara Johnson",
      email: `amara.johnson@${demoDomain}`,
      level: "Resident",
      expertise: "Internal Medicine",
      language: "en",
      city: "Toronto",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Internal Medicine",
      mentorCapacity: 3
    },
    {
      fullName: "Moussa Diop",
      email: `moussa.diop@${demoDomain}`,
      level: "Physician",
      expertise: "Cardiology",
      language: "fr",
      city: "Montreal",
      region: "Quebec",
      availability: "Weekends",
      targetSpecialty: "Cardiology",
      mentorCapacity: 4
    },
    {
      fullName: "Nia Robinson",
      email: `nia.robinson@${demoDomain}`,
      level: "Fellow",
      expertise: "Pediatrics",
      language: "en",
      city: "Ottawa",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Pediatrics",
      mentorCapacity: 3
    },
    {
      fullName: "Cedric Bako",
      email: `cedric.bako@${demoDomain}`,
      level: "Physician",
      expertise: "Neurology",
      language: "fr",
      city: "Quebec City",
      region: "Quebec",
      availability: "Mornings",
      targetSpecialty: "Neurology",
      mentorCapacity: 2
    },
    {
      fullName: "Fatou N'Dour",
      email: `fatou.ndour@${demoDomain}`,
      level: "Resident",
      expertise: "Emergency Medicine",
      language: "fr",
      city: "Laval",
      region: "Quebec",
      availability: "Weekdays",
      targetSpecialty: "Emergency Medicine",
      mentorCapacity: 5
    },
    {
      fullName: "Jordan Campbell",
      email: `jordan.campbell@${demoDomain}`,
      level: "Physician",
      expertise: "Family Medicine",
      language: "en",
      city: "Hamilton",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Family Medicine",
      mentorCapacity: 3
    },
    {
      fullName: "Aline Mukendi",
      email: `aline.mukendi@${demoDomain}`,
      level: "Fellow",
      expertise: "Obstetrics and Gynecology",
      language: "fr",
      city: "Gatineau",
      region: "Quebec",
      availability: "Weekends",
      targetSpecialty: "Obstetrics and Gynecology",
      mentorCapacity: 4
    },
    {
      fullName: "Kofi Mensah",
      email: `kofi.mensah@${demoDomain}`,
      level: "Physician",
      expertise: "General Surgery",
      language: "en",
      city: "Mississauga",
      region: "Ontario",
      availability: "Mornings",
      targetSpecialty: "General Surgery",
      mentorCapacity: 2
    },
    {
      fullName: "Ines Tchoumi",
      email: `ines.tchoumi@${demoDomain}`,
      level: "Resident",
      expertise: "Psychiatry",
      language: "fr",
      city: "Sherbrooke",
      region: "Quebec",
      availability: "Weekdays",
      targetSpecialty: "Psychiatry",
      mentorCapacity: 3
    },
    {
      fullName: "Malik Cooper",
      email: `malik.cooper@${demoDomain}`,
      level: "Physician",
      expertise: "Anesthesiology",
      language: "en",
      city: "Brampton",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Anesthesiology",
      mentorCapacity: 4
    }
  ];

  const menteeSeed = [
    {
      fullName: "Sarah Okoye",
      email: `sarah.okoye@${demoDomain}`,
      academicLevel: "Resident",
      goals: "Find a mentor to refine residency planning and interview preparation.",
      language: "en",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Internal Medicine"
    },
    {
      fullName: "Nadine Elenga",
      email: `nadine.elenga@${demoDomain}`,
      academicLevel: "Fellow",
      goals: "Receive guidance for research strategy and fellowship positioning.",
      language: "fr",
      region: "Quebec",
      availability: "Weekends",
      targetSpecialty: "Cardiology"
    },
    {
      fullName: "Brian Akom",
      email: `brian.akom@${demoDomain}`,
      academicLevel: "Resident",
      goals: "Improve clinical confidence and map a realistic training path.",
      language: "en",
      region: "Ontario",
      availability: "Weekdays",
      targetSpecialty: "Pediatrics"
    },
    {
      fullName: "Aicha Traore",
      email: `aicha.traore@${demoDomain}`,
      academicLevel: "Fellow",
      goals: "Connect with specialists and prepare a strong portfolio.",
      language: "fr",
      region: "Quebec",
      availability: "Mornings",
      targetSpecialty: "Neurology"
    },
    {
      fullName: "David Nwosu",
      email: `david.nwosu@${demoDomain}`,
      academicLevel: "Resident",
      goals: "Get structured mentorship for clinical rotations and career planning.",
      language: "en",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Emergency Medicine"
    },
    {
      fullName: "Mireille Nsame",
      email: `mireille.nsame@${demoDomain}`,
      academicLevel: "Fellow",
      goals: "Build interview readiness and practical leadership habits.",
      language: "fr",
      region: "Quebec",
      availability: "Weekends",
      targetSpecialty: "Family Medicine"
    },
    {
      fullName: "Jayden Pierre",
      email: `jayden.pierre@${demoDomain}`,
      academicLevel: "Resident",
      goals: "Find accountability for exam planning and monthly objectives.",
      language: "en",
      region: "Ontario",
      availability: "Mornings",
      targetSpecialty: "Obstetrics and Gynecology"
    },
    {
      fullName: "Mariama Kamara",
      email: `mariama.kamara@${demoDomain}`,
      academicLevel: "Fellow",
      goals: "Receive support to navigate specialty choices and networking.",
      language: "fr",
      region: "Quebec",
      availability: "Weekdays",
      targetSpecialty: "General Surgery"
    },
    {
      fullName: "Elijah Brown",
      email: `elijah.brown@${demoDomain}`,
      academicLevel: "Resident",
      goals: "Strengthen communication skills and prepare for interviews.",
      language: "en",
      region: "Ontario",
      availability: "Evenings",
      targetSpecialty: "Psychiatry"
    },
    {
      fullName: "Ruth Mbiya",
      email: `ruth.mbiya@${demoDomain}`,
      academicLevel: "Fellow",
      goals: "Develop a concrete transition plan toward advanced training.",
      language: "fr",
      region: "Quebec",
      availability: "Weekends",
      targetSpecialty: "Anesthesiology"
    }
  ];

  await prisma.mentorApplication.createMany({ data: mentorSeed });
  await prisma.menteeApplication.createMany({ data: menteeSeed });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
