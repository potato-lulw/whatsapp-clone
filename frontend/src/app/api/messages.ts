import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { GetMessagesResponse, Message, SendMessageResponse } from '../models/Message';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly apiRoute = `${environment.apiUrl}/api/v1/messages`;

  constructor(private http: HttpClient) {}

  // 📨 fetch all messages in a conversation
  getMessages(conversationId: string) {
    return this.http
      .get<GetMessagesResponse>(`${this.apiRoute}/${conversationId}`, {
        withCredentials: true,
      })
      .pipe(
        map(res => res.messages) // → returns Message[]
      );
  }

  // 🆕 send a new message
  sendMessage(senderId: string, content: string, messageType: string, recipientId: string) {
    return this.http
      .post<SendMessageResponse>(
        `${this.apiRoute}`,
        { senderId, content, messageType, recipientId },
        { withCredentials: true }
      )
      .pipe(
        map(res => res.messageData) // → returns Message
      );
  }


  markMessageRead(messageIds: string[]) {
    return this.http
      .post(
        `${this.apiRoute}/read`,
        { messageIds },
        { withCredentials: true }
      )
      .pipe(
        map(res => res)
      );
  }
}

