// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDb from './utils/db.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cookieParser from 'cookie-parser';

import { createServer } from "http";
import { Server } from "socket.io";
import chatSocket from "./sockets/chatSocket.js";
import presenceSocket from "./sockets/presenceSocket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Express middleware
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// DB
connectToDb();

// REST routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/messages', messageRoutes);
app.get('/health', (_, res) => res.send('Hello World!'));

// Socket.IO init
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  chatSocket(io, socket);
  presenceSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start single server
httpServer.listen(process.env.PORT || 8800, () => {
  console.log(`🚀 Server (REST + WS) running on port ${process.env.PORT || 8800}`);
});
