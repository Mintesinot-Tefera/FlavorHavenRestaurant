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
