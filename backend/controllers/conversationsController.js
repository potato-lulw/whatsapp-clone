import mongoose from "mongoose";
import Conversation from "../models/conversation.js"
import Message from "../models/message.js"

export const getConversations = async (req, res) => {
  try {
    const { id } = req.user;
  
    // const id = new mongoose.Types.ObjectId("6899c50afe75a8caadee929f");
    // console.log(req.user)

    const conversations = await Conversation.find({ participants: id })
      .populate("participants", "name email isOnline") // optional: populate user info
      .populate("latestMessage", "senderId content messageType readBy")
      .exec();

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: "No conversations found", conversations: [] });
    }
    // console.log("conversations", conversations);
    res.status(200).json({ message: "Conversations found", conversations });
  } catch (error) {
    console.error("❌ Error getting conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createGroupConversation = async (req, res) => {
    try {
        const { id } = req.user; 
        const { isGroup = true, participants, groupName } = req.body
        const conversation = await Conversation.create({ isGroup, participants, groupName })
        if (!conversation) {
            res.status(400).json({ message: "Conversation not created" })
        }
        const message = "Group conversation created!"
        const newMessage = await Message.create({ conversationId: conversation._id, senderId: id, content: message, messageType: "special" });
        if (!newMessage) {
            res.status(400).json({ message: "Message not created" })
        }
        conversation.latestMessage = newMessage._id
        await conversation.save()
        res.status(201).json({ message: "Conversation created", conversation })
    } catch (error) {
        console.error("❌ Error creating conversation:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}