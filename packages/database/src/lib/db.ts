// Database utility functions

import prisma from "../index.js";

/**
 * Disconnect from database
 */
export async function disconnectDb() {
  await prisma.$disconnect();
}

/**
 * Connect to database
 */
export async function connectDb() {
  await prisma.$connect();
}

/**
 * Health check for database connection
 */
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
