import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/google", authController.googleAuth);
router.get("/me", authenticate, authController.getProfile);
router.put("/me", authenticate, authController.updateProfile);
router.put("/me/password", authenticate, authController.changePassword);
router.delete("/me", authenticate, authController.deleteAccount);

export default router;
