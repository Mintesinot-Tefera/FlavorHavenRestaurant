import { Router } from "express";
import * as foodController from "../controllers/food.controller";

const router = Router();

router.get("/", foodController.getAll);
router.get("/:id", foodController.getById);

export default router;
