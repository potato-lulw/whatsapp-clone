import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  @Output() sendMessage = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  message = '';

  onTyping() {
    // console.log("✍️ ChatInput fired typing");
    this.typing.emit();
  }


  handleSend() {
    const text = this.message.trim();
    if (!text) return;
    this.sendMessage.emit(text);
    this.message = '';
  }
}
