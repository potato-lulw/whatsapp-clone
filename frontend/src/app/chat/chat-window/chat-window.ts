import { Component, computed, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatInput } from '../chat-input/chat-input';
import { MessageType } from '../../models/Message';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Auth } from '../../core/auth';




@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ChatInput, FontAwesomeModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow {
  @Input() title: string = 'Chat';
  @Input() messages: MessageType[] = [];
  @Input() typingUsers: string[] = [];
  @Output() sendMessage = new EventEmitter<string>();
  @Output() openSidebar = new EventEmitter<void>();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Output() typing = new EventEmitter<void>();

  senderTyping = false;

  ngOnChanges() {
    this.senderTyping = this.typingUsers.filter(u => u !== this.UserId).length > 0;
  }
  private authService = inject(Auth);
  faCheck = faCheck;
  faCheckDouble = faCheckDouble;
  readonly UserId = this.authService.getUserId();


  onTyping() {
    // console.log("📤 ChatWindow re-emitting typing");
    this.typing.emit();
  }



  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll failed', err);
    }
  }

  onSend(text: string) {
    this.sendMessage.emit(text);
  }

  onOpenSidebar() {
    this.openSidebar.emit();
  }
}



