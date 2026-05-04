import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderItemInput {
  foodId: number;
  quantity: number;
}

export async function create(userId: number, items: OrderItemInput[]) {
  if (!items || items.length === 0) {
    throw Object.assign(new Error("Order must have at least one item"), {
      status: 400,
    });
  }

  const foodIds = items.map((item) => item.foodId);
  const foods = await prisma.food.findMany({
    where: { id: { in: foodIds } },
  });

  if (foods.length !== foodIds.length) {
    throw Object.assign(new Error("One or more food items not found"), {
      status: 400,
    });
  }

  const foodPriceMap = new Map(
    foods.map((food) => [food.id, food.price])
  );

  let totalPrice = 0;
  const orderItems = items.map((item) => {
    const price = Number(foodPriceMap.get(item.foodId));
    totalPrice += price * item.quantity;
    return {
      foodId: item.foodId,
      quantity: item.quantity,
      price,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: { food: true },
      },
    },
  });

  return order;
}

export async function getUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { food: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
