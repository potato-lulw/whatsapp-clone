import { Injectable, signal } from '@angular/core';
import { Conversation } from '../models/Conversation';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ConversationsService {
  private readonly apiRoute = `${environment.apiUrl}/api/v1/conversations`;
  readonly conversations = signal<Conversation[]>([]);

  constructor(private http: HttpClient) {}

  loadConversations() {
    this.http.get<{ conversations: Conversation[] }>(this.apiRoute, {withCredentials: true}).subscribe({
      next: res => this.conversations.set(res.conversations),
      error: err => console.error('❌ Failed to fetch conversations', err)
    });
  }
}