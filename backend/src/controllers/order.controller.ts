import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Order items are required" });
      return;
    }

    const order = await orderService.create(userId, items);
    res.status(201).json(order);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getUserOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orderId = parseInt(req.params.id as string, 10);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    const order = await orderService.updateStatus(orderId, status);
    res.json(order);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function cancelOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orderId = parseInt(req.params.id as string, 10);
    const userId = req.user!.userId;
    const order = await orderService.cancelOrder(orderId, userId);
    res.json(order);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}
