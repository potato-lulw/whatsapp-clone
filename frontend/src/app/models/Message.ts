export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  readBy: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesResponse {
  message: string;
  messages: Message[];
}

export interface SendMessageResponse {
  message: string;
  conversationId: string;
  messageData: Message;
}

export type MessageType = { id: string; sender: 'me' | 'them'; senderId: string; text: string; readBy: string[]; time: string };