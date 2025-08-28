import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  private typingSubject = new BehaviorSubject<{ conversationId: string, typing: string[] }>({ conversationId: '', typing: [] });
  typing$ = this.typingSubject.asObservable();



  constructor() {
    this.socket = io('http://localhost:8800', { withCredentials: true });
    this.socket.on('onlineUsers', (users: string[]) => {
      this.onlineUsersSubject.next(users);
    });

    this.socket.on("typing:update", (data: any) => {
      // console.log("📡 typing:update received from server:", data);
      this.typingSubject.next(data);
    });
  }

  // generic
  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket.off(event);
  }

  // ✅ Join with userId
  join(userId: string) {
    this.socket.emit("user:join", userId);
  }

  // ✅ Send message
  sendMessage(data: {
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
    tempId: string;
  }) {
    this.socket.emit("message:send", data);
  }

  // ✅ Incoming new message
  onNewMessage(callback: (msg: any) => void) {
    this.socket.on("message:new", callback);
  }

  // ✅ Presence events
  onUserOnline(callback: (userId: string) => void) {
    this.socket.on("user:online", callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket.on("user:offline", callback);
  }


  startTyping(conversationId: string, senderId: string, recipientId: string) {
    this.socket.emit("typing:start", { conversationId, senderId, recipientId });
  }

  stopTyping(conversationId: string, senderId: string, recipientId: string) {
    this.socket.emit("typing:stop", { conversationId, senderId, recipientId });
  }

  onTypingUpdate() {
    this.socket.on("typing:update", (data) => {
      // console.log("📡 Received typing:update", data);
      this.typingSubject.next(data);
    });
  }

  markMessagesRead(conversationId: string, userId: string, messageIds: string[], recipientId: string) {
    // console.log("📤 [CLIENT] Emitting message:read", { conversationId, userId, messageIds, recipientId });
    this.socket.emit("message:read", { conversationId, userId, messageIds, recipientId });
  }

  onMessageReadUpdate(callback: (data: { conversationId: string, userId: string, messageIds: string[], recipientId: string }) => void) {
    this.socket.on("message:read:update", (data) => {
      // console.log("📥 [CLIENT] Received message:read:update", data);
      callback(data);
    });
  }



}
