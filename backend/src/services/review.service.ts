import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertReview(
  userId: number,
  foodId: number,
  rating: number,
  comment?: string
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw Object.assign(
      new Error("Rating must be an integer between 1 and 5"),
      { status: 400 }
    );
  }

  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food) {
    throw Object.assign(new Error("Food not found"), { status: 404 });
  }

  return prisma.review.upsert({
    where: { userId_foodId: { userId, foodId } },
    create: {
      userId,
      foodId,
      rating,
      comment: comment ?? null,
    },
    update: {
      rating,
      comment: comment ?? null,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}

export async function getByFood(foodId: number) {
  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food) {
    throw Object.assign(new Error("Food not found"), { status: 404 });
  }

  return prisma.review.findMany({
    where: { foodId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteReview(userId: number, foodId: number) {
  const review = await prisma.review.findUnique({
    where: { userId_foodId: { userId, foodId } },
  });

  if (!review) {
    throw Object.assign(new Error("Review not found"), { status: 404 });
  }

  await prisma.review.delete({ where: { userId_foodId: { userId, foodId } } });
}
