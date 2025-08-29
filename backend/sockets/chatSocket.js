import Message from "../models/message.js";
import Conversation from "../models/conversation.js"

export default function chatSocket(io, socket) {
  // When a user joins
  socket.on("user:join", (userId) => {
    socket.join(userId);
    io.emit("user:online", userId);

    socket.on("disconnect", () => {
      io.emit("user:offline", userId);
    });
  });

  // Handle message send
  socket.on("message:send", async (data) => {
    const { conversationId, senderId, recipientId, content, tempId } = data;

    const saved = await Message.create({
      conversationId,
      senderId,
      recipientId,
      content,
    });

    await Conversation.findByIdAndUpdate(conversationId, { latestMessage: saved._id });

    const fullMsg = {
      ...saved.toObject(),
      tempId, // carry back so client knows which optimistic msg to replace
    };

    // Send back to sender (replace temp msg)
    io.to(senderId).emit("message:new", fullMsg);

    // Send to recipient (they never saw temp, so they just add normally)
    io.to(recipientId).emit("message:new", fullMsg);
  });


  // server.js (inside io.on("connection"))
  socket.on("message:read", async ({ conversationId, userId, messageIds, recipientId }) => {
    console.log("📩 [SERVER] message:read received", { conversationId, userId, messageIds, recipientId });

    const payload = { conversationId, userId, messageIds };

    // update DB
    const result = await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: userId } }
    );

    if (result.modifiedCount > 0) {
      // notify reader (so their local UI updates instantly)
      io.to(userId).emit("message:read:update", payload);

      // notify sender (so they see "double tick")
      if (recipientId) {
        io.to(recipientId).emit("message:read:update", payload);
      }

      // optional ack for the reader
      io.to(userId).emit("message:read:ack", { success: true });
    }
  });



  const typingUsers = new Map(); // convoId -> Set of userIds

  socket.on("typing:start", ({ conversationId, senderId, recipientId }) => {
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Set());
    }
    typingUsers.get(conversationId).add(senderId);

    const payload = {
      conversationId,
      typing: Array.from(typingUsers.get(conversationId)),
    };

    io.to(senderId).emit("typing:update", payload);
    io.to(recipientId).emit("typing:update", payload);
  });


  socket.on("typing:stop", ({ conversationId, senderId, recipientId }) => {
    // console.log(`🛑 typing:stop from ${senderId} in convo ${conversationId}, notifying ${recipientId}`);

    if (typingUsers.has(conversationId)) {
      typingUsers.get(conversationId).delete(senderId);
    }

    // console.log("Current typers:", Array.from(typingUsers.get(conversationId) || []));
    const payload = {
      conversationId,
      typing: Array.from(typingUsers.get(conversationId)),
    };

    io.to(senderId).emit("typing:update", payload);
    io.to(recipientId).emit("typing:update", payload);
  });



}
