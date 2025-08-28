import mongoose from "mongoose";
import { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema({
    isGroup: {
        type: Boolean,
        default: false
    },
    participants: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: arr => arr.length >= 2,
            message: "A conversation must have at least 2 participants."
        },
        required: true,
        index: true
    },
    groupName: {
        type: String,
        required: function() {
            return this.isGroup
        },
    },
    latestMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    }
    
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;