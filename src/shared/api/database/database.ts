import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForDatabase = globalThis as typeof globalThis & {
  gameDatabase?: PrismaClient;
};

function createDatabaseClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 20_000,
  });

  return new PrismaClient({ adapter });
}

export function getDatabase() {
  if (!globalForDatabase.gameDatabase) {
    globalForDatabase.gameDatabase = createDatabaseClient();
  }

  return globalForDatabase.gameDatabase;
}
