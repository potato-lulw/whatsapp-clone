import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: function() {
            return !this.fileUrl
        }
    },
    fileUrl: {
        type: String // Optional: For image/video/file
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "file", "special"],
        default: "text",
        required: true
    },
    readBy: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Message = mongoose.model("Message", messageSchema);
export default Message