import express from "express";
import { createQuery, getQueries, deleteQuery, updateQuery } from "../controllers/queryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createQuery);
router.get("/", protect, getQueries);
router.put("/:id", protect, updateQuery);
router.delete("/:id", protect, deleteQuery);
export default router;
