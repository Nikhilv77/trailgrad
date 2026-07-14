import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@/lib/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as typeof globalThis & {
  trailgradPrismaWs?: PrismaClient;
};

const requiredPrismaDelegates = ["jobApplication"] as const;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Trailgrad profile storage.");
  }

  return databaseUrl;
}

function hasRequiredPrismaDelegates(client: PrismaClient | undefined) {
  if (!client) {
    return false;
  }

  const candidate = client as PrismaClient & Record<string, unknown>;

  return requiredPrismaDelegates.every((delegate) => Boolean(candidate[delegate]));
}

const cachedPrisma = globalForPrisma.trailgradPrismaWs;

if (cachedPrisma && !hasRequiredPrismaDelegates(cachedPrisma)) {
  void cachedPrisma.$disconnect().catch(() => undefined);
}

const prismaClient: PrismaClient = cachedPrisma && hasRequiredPrismaDelegates(cachedPrisma)
  ? cachedPrisma
  : new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: getDatabaseUrl(),
    }),
  });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.trailgradPrismaWs = prisma;
}
