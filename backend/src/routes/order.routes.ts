import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.post("/", authenticate, orderController.create);
router.get("/", authenticate, orderController.getUserOrders);
router.get("/admin", authenticate, requireAdmin, orderController.getAllOrders);
router.patch("/:id/status", authenticate, requireAdmin, orderController.updateStatus);
router.patch("/:id/cancel", authenticate, orderController.cancelOrder);

export default router;
