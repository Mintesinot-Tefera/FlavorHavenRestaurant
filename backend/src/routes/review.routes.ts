import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/food/:foodId", reviewController.getByFood);
router.post("/food/:foodId", authenticate, reviewController.upsertReview);

export default router;
