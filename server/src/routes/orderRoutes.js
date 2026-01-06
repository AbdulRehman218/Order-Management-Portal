import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
  getDeletedOrders,
  restoreOrder,
  permanentDeleteOrder,
  deleteOrders
} from "../controllers/orderController.js";

const router = express.Router();
router.post("/", protect, createOrder);
router.post("/delete-multiple", protect, deleteOrders);
router.get("/", protect, getOrders);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);
router.get("/deleted", protect, getDeletedOrders);
router.put("/:id/restore", protect, restoreOrder);
router.delete("/:id/permanent", protect, permanentDeleteOrder);
export default router;
