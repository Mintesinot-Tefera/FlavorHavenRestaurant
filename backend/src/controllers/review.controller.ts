import { Request, Response, NextFunction } from "express";
import * as reviewService from "../services/review.service";

export async function upsertReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const foodId = parseInt(req.params.foodId as string, 10);

    if (isNaN(foodId)) {
      res.status(400).json({ message: "Invalid food ID" });
      return;
    }

    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) {
      res.status(400).json({ message: "Rating is required" });
      return;
    }

    const review = await reviewService.upsertReview(
      userId,
      foodId,
      Number(rating),
      comment as string | undefined
    );

    res.status(201).json(review);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getByFood(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foodId = parseInt(req.params.foodId as string, 10);

    if (isNaN(foodId)) {
      res.status(400).json({ message: "Invalid food ID" });
      return;
    }

    const reviews = await reviewService.getByFood(foodId);
    res.json(reviews);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const foodId = parseInt(req.params.foodId as string, 10);

    if (isNaN(foodId)) {
      res.status(400).json({ message: "Invalid food ID" });
      return;
    }

    await reviewService.deleteReview(userId, foodId);
    res.status(204).send();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
}
