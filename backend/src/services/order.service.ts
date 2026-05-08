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

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { food: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateStatus(orderId: number, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { status: 404 });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { food: true } },
    },
  });
}

export async function cancelOrder(orderId: number, userId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { status: 404 });
  }
  if (order.userId !== userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 403 });
  }
  if (order.status !== "PENDING") {
    throw Object.assign(
      new Error("Only pending orders can be cancelled"),
      { status: 400 }
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    include: { items: { include: { food: true } } },
  });
}
