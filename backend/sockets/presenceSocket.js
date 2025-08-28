const onlineUsers = new Map(); // userId -> socketId

export default function presenceSocket(io, socket) {
  socket.on("user:join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 User ${userId} joined`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    for (let [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`🔴 User ${userId} left`);
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
}
