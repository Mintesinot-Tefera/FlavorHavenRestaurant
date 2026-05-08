import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function create(name: string) {
  const existing = await prisma.category.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) {
    throw Object.assign(new Error("Category already exists"), { status: 409 });
  }
  return prisma.category.create({ data: { name } });
}

export async function remove(id: number) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }
  const foodCount = await prisma.food.count({ where: { categoryId: id } });
  if (foodCount > 0) {
    throw Object.assign(
      new Error(`Cannot delete category with ${foodCount} food item(s)`),
      { status: 409 }
    );
  }
  return prisma.category.delete({ where: { id } });
}
