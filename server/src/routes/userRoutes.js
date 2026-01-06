import express from "express";
import { getUsers, updateUser, deleteUser, addAccount, listAccounts, deleteAccount, updateAccount } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, adminOnly, getUsers);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/:id/accounts", protect, adminOnly, listAccounts);
router.post("/:id/accounts", protect, adminOnly, addAccount);
router.put("/:id/accounts/:accountId", protect, adminOnly, updateAccount);
router.delete("/:id/accounts/:accountId", protect, adminOnly, deleteAccount);
export default router;
