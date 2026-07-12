import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@/lib/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as typeof globalThis & {
  trailgradPrismaWs?: PrismaClient;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Trailgrad profile storage.");
  }

  return databaseUrl;
}

export const prisma =
  globalForPrisma.trailgradPrismaWs ??
  new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: getDatabaseUrl(),
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.trailgradPrismaWs = prisma;
}
