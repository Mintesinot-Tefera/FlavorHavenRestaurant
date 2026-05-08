import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.get("/", categoryController.getAll);
router.post("/", authenticate, requireAdmin, categoryController.create);
router.delete("/:id", authenticate, requireAdmin, categoryController.remove);

export default router;
