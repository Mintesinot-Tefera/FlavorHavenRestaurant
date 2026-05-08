import { Router } from "express";
import * as foodController from "../controllers/food.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.get("/", foodController.getAll);
router.get("/:id", foodController.getById);
router.post("/", authenticate, requireAdmin, foodController.create);
router.delete("/:id", authenticate, requireAdmin, foodController.remove);

export default router;
