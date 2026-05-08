import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";

export async function getAll(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: "Category name is required" });
      return;
    }
    const category = await categoryService.create(name.trim());
    res.status(201).json(category);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid category ID" });
      return;
    }
    await categoryService.remove(id);
    res.json({ message: "Category deleted" });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}
