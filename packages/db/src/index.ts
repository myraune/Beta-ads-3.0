import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __betaPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__betaPrisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" }
    ]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__betaPrisma = prisma;
}

export * from "@prisma/client";
