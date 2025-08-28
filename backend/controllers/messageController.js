import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import Notification from "../models/notification.js";

export const sendMessage = async (req, res) => {
    try {
        const { senderId, recipientId, content, messageType } = req.body;

        if (!senderId || !recipientId || !content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1️⃣ Check if conversation already exists
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [senderId, recipientId], $size: 2 }
        });

        // 2️⃣ If not, create a new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recipientId],
                isGroup: false
            });
        }

        // 3️⃣ Create the message
        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            content,
            messageType: messageType || "text",
            readBy: [senderId] // sender has "read" their own message
        });

        // 4️⃣ Update conversation's latest message
        conversation.latestMessage = message._id;
        await conversation.save();

        // 5️⃣ Create a notification for the recipient
        await Notification.create({
            recipientId,
            notificationType: "message",
            content: `${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
            relatedId: message._id
        });

        // 6️⃣ Respond
        res.status(201).json({
            message: "Message sent successfully",
            conversationId: conversation._id,
            messageData: message
        });

    } catch (error) {
        console.error("❌ Error sending message:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMessageByMessageId = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.status(200).json({ message: "Message found", message });
    } catch (error) {
        console.error("❌ Error getting message:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMessageByConversationId = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({conversationId});
        if (!messages) {
            return res.status(404).json({ message: "Messages not found" });
        }
        res.status(200).json({ message: "Messages found", messages });
    } catch (error) {
        console.error("❌ Error getting messages:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        if (!messages) {
            return res.status(404).json({ message: "Messages not found" });
        }
        res.status(200).json({ message: "Messages found", messages });
    } catch (error) {
        console.error("❌ Error getting messages:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markMessageread = async (req, res) => {
    try {
        const {id} = req.user;
        const {messageIds} = req.body;
        // console.log(messageIds)
        if(!Array.isArray(messageIds) || messageIds.length === 0) {
            res.status(400).json({ message: "No messages IDs provided" });
        }
        await Message.updateMany(
            {_id: {$in: messageIds}},
            {$addToSet: {readBy: id}}
        )

        res.status(200).json({ message: "Messages marked as read" });

    } catch (error) {
        console.error("❌ Error getting messages:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}