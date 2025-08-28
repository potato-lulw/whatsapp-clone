import express from "express";
import { getAllMessages, getMessageByConversationId, markMessageread, sendMessage } from "../controllers/messageController.js";
import { protectedRoute } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.use(protectedRoute);

router.get("/", getAllMessages);
router.get("/:conversationId", getMessageByConversationId);


router.post("/", sendMessage);
router.post("/read", markMessageread);

export default router


// POST   /api/v1/messages            → Send a message
// GET    /api/v1/messages/:convId    → Get all messages in a conversation
// TODO PATCH  /api/v1/messages/:id/read   → Mark message as read
// TODO DELETE /api/v1/messages/:id        → Delete message (optional)
