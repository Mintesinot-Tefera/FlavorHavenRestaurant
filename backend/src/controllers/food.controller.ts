import { Request, Response, NextFunction } from "express";
import * as foodService from "../services/food.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string, 10)
      : undefined;
    const search = req.query.search as string | undefined;

    const foods = await foodService.getAll(categoryId, search);
    res.json(foods);
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid food ID" });
      return;
    }

    const food = await foodService.getById(id);
    res.json(food);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}
