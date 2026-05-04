import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll(categoryId?: number, search?: string) {
  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const foods = await prisma.food.findMany({
    where,
    include: {
      category: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { name: "asc" },
  });

  const foodIds = foods.map((f) => f.id);

  const avgRatings = await prisma.review.groupBy({
    by: ["foodId"],
    where: { foodId: { in: foodIds } },
    _avg: { rating: true },
  });

  const avgRatingMap = new Map<number, number | null>(
    avgRatings.map((r) => [r.foodId, r._avg.rating])
  );

  return foods.map(({ _count, ...food }) => ({
    ...food,
    avgRating: avgRatingMap.get(food.id) ?? null,
    reviewCount: _count.reviews,
  }));
}

export async function getById(id: number) {
  const food = await prisma.food.findUnique({
    where: { id },
    include: {
      category: true,
      _count: { select: { reviews: true } },
    },
  });

  if (!food) {
    throw Object.assign(new Error("Food not found"), { status: 404 });
  }

  const aggregate = await prisma.review.aggregate({
    where: { foodId: id },
    _avg: { rating: true },
  });

  const { _count, ...foodData } = food;
  return {
    ...foodData,
    avgRating: aggregate._avg.rating,
    reviewCount: _count.reviews,
  };
}
