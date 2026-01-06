import express from "express";
import { login, register, forgotPassword, resetPassword, verifyCode } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", protect, adminOnly, register);
router.post("/forgot", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset", resetPassword);

export default router;
