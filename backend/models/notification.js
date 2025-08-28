import mongoose from "mongoose";
import { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    notificationType: {
        type: String,
        required: true,
        enum: ["message", "friendRequest", "groupRequest"],
        default: "message"
    }, 
    relatedId: {
        type: Schema.Types.ObjectId, // e.g. link to message or conversation
        required: false
    },
    content: {
        type: String,
        required: true
    }, 
    isRead: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification