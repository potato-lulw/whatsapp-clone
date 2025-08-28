import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from "../../shared/components/theme/theme-toggle/theme-toggle";
import { HlmButton } from "@spartan-ng/helm/button";
import { Auth } from '../../core/auth';
import { ChatPreview } from '../../models/Conversation';


@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, ThemeToggle, HlmButton],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css',
})
export class ChatSidebar {
  @Input() chats: ChatPreview[] = [];
  @Input() activeChatId: string | null = null;
  @Input() onOpenWelcome: () => void = () => {};
  @Output() selectChat = new EventEmitter<string>();
  @Input() online = new Set<string>();
  private authService = inject(Auth);

  onSelect(id: string) {
    this.selectChat.emit(id);
  }

  onLogout() {
    this.authService.logout();
  }
}
