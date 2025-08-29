import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSidebar } from './chat-sidebar/chat-sidebar';
import { ChatWindow } from './chat-window/chat-window';
import { ChatWelcome } from "./chat-welcome/chat-welcome";
import { ConversationsService } from '../api/conversations';
import { ChatPreview } from '../models/Conversation';
import { MessagesService } from '../api/messages';
import { Auth } from '../core/auth';
import { Message, MessageType } from '../models/Message';
import { format, formatDistanceToNow } from 'date-fns';
import { SocketService } from '../socket/socket';
import { map, switchMap } from 'rxjs';
import { nanoid } from "nanoid";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewChatForm } from '../shared/components/new-chat-form/new-chat-form';
import { UsersService } from '../api/users';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatSidebar, ChatWindow, ChatWelcome, NewChatForm],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat {

  private convoService = inject(ConversationsService);
  private messagesService = inject(MessagesService);
  private authService = inject(Auth);
  private socketService = inject(SocketService);
  private userService = inject(UsersService)
  readonly conversations = signal<Record<string, MessageType[]>>({});
  readonly UserId = this.authService.getUserId();

  readonly selectedChatId = signal<string | null>(null);
  readonly showSidebar = signal<boolean>(false);
  readonly showNewChatForm = signal<boolean>(false);
  private readMessages = signal<string[]>([]);
  readonly online = signal<Set<string>>(new Set());
  typingUsers = signal<string[]>([]);
  private typingTimeout: any = null;
  newChatForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.newChatForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]],
    })
  }

  onNewChatButtonClick = () => {
    this.showNewChatForm.set(true);
  }

  onNewChatFormSubmit({ email, message }: { email: string; message: string }) {
  console.log("New chat started with", email);
  console.log("Message:", message);

  this.userService.getUserByEmail(email).pipe(
    switchMap(user => {
      if (!user) {
        throw new Error("User not found");
      }
      return this.messagesService.sendMessage(this.UserId, message, 'text', user._id);
    })
  ).subscribe({
    next: (messageData: Message) => {
      const newConvId = messageData.conversationId;

      // set as active
      this.selectedChatId.set(newConvId);

      // ensure conversation exists
      if (!this.conversations()[newConvId]) {
        this.conversations.update(map => ({ ...map, [newConvId]: [] }));
      }

      // add the first message immutably
      this.conversations.update(map => {
        const list = map[newConvId] ?? [];
        return {
          ...map,
          [newConvId]: [
            ...list,
            {
              id: messageData._id,
              senderId: this.UserId,
              text: message,
              sender: 'me',
              time: new Date(messageData.createdAt ?? Date.now()).toISOString(),
              readBy: [this.UserId],
            }
          ]
        };
      });

      // reload conversations if you need to sync with backend
      this.convoService.loadConversations();

      // close form
      this.showNewChatForm.set(false);
    },
    error: err => {
      console.error("Error starting new chat:", err);
    }
  });
}



  readonly chats = computed<ChatPreview[]>(() =>
    this.convoService.conversations().map(c => {
      const other = c.participants.find(p => p._id !== this.UserId) ?? c.participants[0];
      return {
        id: c._id,
        name: other.name,
        chatterId: other._id,
        lastMessage: c.latestMessage ?? {
          senderId: '',
          content: '',
          messageType: 'text',
          readBy: []
        },
      };
    })
  );

  readonly activeChat = computed(() =>
    this.chats().find(c => c.id === this.selectedChatId()) ?? null
  );

  readonly currentMessages = computed<MessageType[]>(() => {
    const id = this.selectedChatId();
    if (!id) return [];
    return this.conversations()[id] ?? [];
  });

  onSelectChat = (conversationId: string) => {
    this.selectedChatId.set(conversationId);
    this.showSidebar.set(false);
    this.readMessages.set([]);

    // if (!this.conversations()[conversationId] || this.conversations()[conversationId].length === 0) {
    this.messagesService.getMessages(conversationId).subscribe(rawMsgs => {
      const messageIdsToMark: string[] = [];

      const formatted: MessageType[] = rawMsgs.map(m => {
        const created = new Date(m.createdAt);
        if (!m.readBy?.includes(this.UserId)) {
          messageIdsToMark.push(m._id);
        }
        return {
          id: m._id,
          sender: m.senderId === this.UserId ? "me" : "them",
          senderId: m.senderId,
          text: m.content,
          readBy: m.readBy ?? [],
          time: `${formatDistanceToNow(created, { addSuffix: true })} ${format(created, 'HH:mm')}`
        };
      });

      this.readMessages.set(messageIdsToMark);
      this.conversations.update(map => ({ ...map, [conversationId]: formatted }));

      if (messageIdsToMark.length > 0) {
        // emit instantly (so UI updates before DB catches up)
        this.socketService.markMessagesRead(
          conversationId,
          this.UserId,
          messageIdsToMark,
          this.activeChat()?.chatterId!
        );

        // optional REST fallback for persistence (DB sync)
        // this.messagesService.markMessageRead(messageIdsToMark).subscribe();
      }
    });


    if (!this.conversations()[conversationId]) {
      this.conversations.update(map => ({ ...map, [conversationId]: [] }));
    }
    // }
  };

  onRequestOpenSidebar = () => {
    this.showSidebar.set(true);
  };

  onSendMessage = (text: string) => {
    const tempId = nanoid();
    const convoId = this.selectedChatId();
    const recipientId = this.activeChat()?.chatterId;
    if (!convoId || !recipientId) {
      console.log("⚠️ Missing convoId or recipientId");
      return;
    }
    this.conversations.update(map => {
      const next = { ...map };
      const list = next[convoId] ? [...next[convoId]] : [];
      list.push({
        id: tempId, // temporary
        sender: "me",
        senderId: this.UserId,
        text,
        readBy: [this.UserId],
        time: new Date().toISOString()
      });
      next[convoId] = list;
      return next;
    });

    this.socketService.sendMessage({ conversationId: convoId, senderId: this.UserId, recipientId, content: text, tempId });
    this.socketService.stopTyping(convoId, this.UserId, recipientId);
  };

  onOpenWelcome = () => {
    this.selectedChatId.set(null);
    this.showSidebar.set(false);
  }


  onInput() {
    // console.log("📥 Chat received typing event");

    if (this.typingTimeout) clearTimeout(this.typingTimeout);

    const convoId = this.selectedChatId();
    const recipientId = this.activeChat()?.chatterId;
    if (!convoId || !recipientId) {
      console.log("⚠️ Missing convoId or recipientId");
      return;
    }

    // console.log("🚀 Emitting typing:start", { conversationid: convoId, senderId: this.UserId, recipientId : recipientId });
    this.socketService.startTyping(convoId, this.UserId, recipientId);

    this.typingTimeout = setTimeout(() => {
      // console.log("🛑 Emitting typing:stop");
      this.socketService.stopTyping(convoId, this.UserId, recipientId);
    }, 2000);
  }



  ngOnInit() {
    this.convoService.loadConversations();
    this.socketService.join(this.UserId);

    this.socketService.onlineUsers$.subscribe(users => {
      this.online.set(new Set(users));
    });

    this.socketService.onNewMessage((msg: any) => {
      const convoId = msg.conversationId;
      if (!convoId) return;

      this.conversations.update(map => {
        const next = { ...map };
        const list = next[convoId] ? [...next[convoId]] : [];

        // 🪄 If we got a tempId, replace optimistic msg
        if (msg.tempId) {
          const idx = list.findIndex(m => m.id === msg.tempId);
          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              id: msg._id, // real Mongo ID replaces tempId
              time: new Date(msg.createdAt ?? Date.now()).toISOString(),
            };
            next[convoId] = list;
            return next;
          }
        }

        // Otherwise, push normally
        list.push({
          id: msg._id,
          sender: msg.senderId === this.UserId ? "me" : "them",
          senderId: msg.senderId,
          text: msg.content,
          readBy: [this.UserId],
          time: new Date(msg.createdAt ?? Date.now()).toISOString()
        });

        next[convoId] = list;
        return next;
      });


      if (this.selectedChatId() === msg.conversationId) {
        console.log("📤 [CLIENT] Emitting message:read");
        this.socketService.markMessagesRead(
          msg.conversationId,
          this.UserId,
          [msg._id], // use _id consistently
          this.activeChat()?.chatterId!
        );
      }
    });


    this.socketService.typing$.subscribe(data => {
      // console.log("👀 Typing subscription triggered", data);

      const convoId = this.selectedChatId();
      if (!convoId) return;

      if (data.conversationId === convoId) {
        // console.log("✅ Updating typingUsers signal", data.typing);
        this.typingUsers.set(data.typing);
      }
    });

    this.socketService.onMessageReadUpdate(({ conversationId, userId, messageIds }) => {
      this.conversations.update(map => {
        const next = { ...map };
        const msgs = next[conversationId]?.map(m => {
          if (messageIds.includes(m.id)) {
            return {
              ...m,
              readBy: Array.from(new Set([...m.readBy, userId])) // dedupe
            };
          }
          return m;
        });
        if (msgs) next[conversationId] = msgs;
        return next;
      });
    });


  }

}
