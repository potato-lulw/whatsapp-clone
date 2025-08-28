export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
  }[];
  latestMessage?: {
    _id: string;
    senderId: string;
    content: string;
    messageType: string;
    readBy: string[];
  };
}


export interface ChatPreview {
  id: string;           // conversation id
  chatterId: string;
  name: string;         // display name
  lastMessage: {
    senderId: string;     // sender id
    content: string;
    messageType: string;
    readBy: string[];
  };  // preview text
}