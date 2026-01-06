import express from "express";
import { chatWithAi } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Depending on requirements, this might need protection. 
// Adding protect middleware to be safe, assuming AI use requires login.
router.post("/groq-chat", protect, chatWithAi);

export default router;
