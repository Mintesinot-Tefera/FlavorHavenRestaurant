import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, orderController.create);
router.get("/", authenticate, orderController.getUserOrders);

export default router;
