import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalPourPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function creerClientPrisma() {
  const adaptateur = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter: adaptateur });
}

export const prisma = globalPourPrisma.prisma ?? creerClientPrisma();

if (process.env.NODE_ENV !== "production") globalPourPrisma.prisma = prisma;
