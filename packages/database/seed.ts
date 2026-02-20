// index.ts
// Query your database using the Prisma Client

import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Example query to create a user based on the example schema

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD is not set");
}

async function encryptPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

console.log("Seeding database...");

async function createAdminUser() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    console.log("Users already seeded");
    return;
  }

  const encryptedPassword = await encryptPassword(ADMIN_PASSWORD!);

  const user = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@chatting-app.com",
      password: encryptedPassword,
      role: "ADMIN",
      color: "#e92a67",
    },
  });

  console.log("User created:", user);
  return user;
}

async function createRooms() {
  const rooms = await prisma.room.findMany();
  if (rooms.length > 0) {
    console.log("Rooms already seeded");
    return;
  }

  const createdRooms = await prisma.room.createMany({
    data: [{ name: "General" }, { name: "Gaming" }, { name: "Programming" }],
  });

  console.log("Rooms created:", createdRooms);
  return createdRooms;
}

async function seed() {
  await createAdminUser();
  await createRooms();
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
