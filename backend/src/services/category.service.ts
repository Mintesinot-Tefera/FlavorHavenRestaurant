import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
