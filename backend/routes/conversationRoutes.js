import express from "express";
import { createGroupConversation, getConversations } from "../controllers/conversationsController.js";
import { protectedRoute } from "../middlewares/authMiddlewares.js";

const router = express.Router();


router.use(protectedRoute)

router.get("/", getConversations);
router.post("/", createGroupConversation);

export default router;



// TODO POST   /api/v1/conversations       → Create new conversation (1-to-1 or group)
// TODO GET    /api/v1/conversations       → Get all conversations for current user
// TODO GET    /api/v1/conversations/:id   → Get specific conversation
// TODO PATCH  /api/v1/conversations/:id   → Update conversation (e.g., rename group)
// TODO DELETE /api/v1/conversations/:id   → Delete conversation