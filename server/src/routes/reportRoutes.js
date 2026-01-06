import express from "express";
import { getSummary, exportOrdersXlsx, exportQueriesXlsx } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getSummary);
router.get("/orders", protect, exportOrdersXlsx);
router.get("/queries", protect, exportQueriesXlsx);
export default router;
