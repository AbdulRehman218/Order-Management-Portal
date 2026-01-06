import express from "express";
import { profitChart } from "../controllers/chartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/profit", protect, profitChart);
export default router;
