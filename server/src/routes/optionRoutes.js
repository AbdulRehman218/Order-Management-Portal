import express from "express";
import { listHandlers, addHandler, deleteHandler } from "../controllers/optionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/handlers", protect, listHandlers);
router.post("/handlers", protect, adminOnly, addHandler);
router.delete("/handlers/:id", protect, adminOnly, deleteHandler);
export default router;
