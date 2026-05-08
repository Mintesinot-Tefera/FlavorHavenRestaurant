import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.get("/", authenticate, requireAdmin, userController.getAll);

export default router;
