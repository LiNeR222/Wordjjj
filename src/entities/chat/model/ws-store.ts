import { Centrifuge } from 'centrifuge';
import { makeAutoObservable, runInAction } from 'mobx';
import { WS_ORIGIN } from '@/shared/config';
import { tokenStore } from '@/entities/token/model';
import { chatApi } from '../api';
import type { WsEvent, WsNewMessage, WsTyping, WsUserStatus } from '../types';
import { activeChatStore } from './active-chat-store';
import { chatListStore } from './chat-list-store';

const WS_URL = `${WS_ORIGIN}/connection/websocket`;

export class WsStore {
  connected = false;
  typingUsers: Map<number, { userId: number; timeout: ReturnType<typeof setTimeout> }> = new Map();

  private client: Centrifuge | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  connect = () => {
    if (this.client) return;

    const token = tokenStore.access_token;
    if (!token) return;

    try {
      const client = new Centrifuge(WS_URL, {
        data: { token },
      });

      client.on('connected', () => {
        runInAction(() => { this.connected = true; });
      });

      client.on('disconnected', () => {
        runInAction(() => { this.connected = false; });
      });

      client.on('publication', ctx => this.handleEvent(ctx.data as WsEvent));

      this.client = client;
      client.connect();
    } catch (err) {
      console.error('[WS] Connection failed:', err);
    }
  };

  disconnect = () => {
    this.client?.disconnect();
    this.client = null;
    this.connected = false;
    this.typingUsers.clear();
  };

  sendTyping = (chatId: number) => {
    chatApi.sendTyping(chatId, true).catch(() => {});
  };

  getTypingUsersForChat = (chatId: number): number[] => {
    const result: number[] = [];
    this.typingUsers.forEach((val, key) => {
      const keyChatId = Math.floor(key / 1000000);
      if (keyChatId === chatId) result.push(val.userId);
    });
    return result;
  };

  // --- Private ---

  private handleEvent = (event: WsEvent) => {
    switch (event.type) {
      case 'new_message':
        this.handleNewMessage(event);
        break;
      case 'typing':
        this.handleTyping(event);
        break;
      case 'user_status':
        this.handleUserStatus(event);
        break;
      case 'message_read':
        // No action needed — unread counts are managed locally
        // when selecting a chat and via new_message handler
        break;
      case 'message_updated':
        this.handleMessageUpdated(event);
        break;
      case 'message_deleted':
        this.handleMessageDeleted(event);
        break;
      case 'reaction_added':
      case 'reaction_removed':
        this.handleReaction(event);
        break;
    }
  };

  private handleNewMessage = async (event: WsNewMessage) => {
    const isActiveChat = activeChatStore.chatId === event.chat_id;

    // Update sidebar locally: bump unread count & update last_message preview
    runInAction(() => {
      const chat = chatListStore.chats.find(c => c.id === event.chat_id);
      if (chat) {
        if (!isActiveChat) {
          chat.unread_count += 1;
        }
        // Update last message preview
        chat.last_message = {
          id: event.message_id,
          sender_id: event.sender_id,
          content: event.content || '',
          video_id: event.video_id ?? null,
          nomenclature_id: event.nomenclature_id ?? null,
          forwarded_from_id: null,
          file_ids: [],
          created_at: new Date().toISOString(),
          is_read: isActiveChat,
        };
        // Move chat to top (after pinned chats)
        const idx = chatListStore.chats.indexOf(chat);
        if (idx > 0) {
          chatListStore.chats.splice(idx, 1);
          const firstUnpinned = chatListStore.chats.findIndex(c => !c.is_pinned);
          chatListStore.chats.splice(firstUnpinned >= 0 ? firstUnpinned : 0, 0, chat);
        }
      }
    });

    // If this is the active chat, fetch new messages and auto-mark as read
    if (isActiveChat) {
      try {
        const res = await chatApi.getMessages(event.chat_id);
        runInAction(() => {
          activeChatStore.messages = res.messages.reverse();
          activeChatStore.totalCount = res.count;
        });
        chatApi.sendReadReceipt(event.chat_id, event.message_id).catch(() => {});
      } catch {}
    }
  };

  private handleTyping = (event: WsTyping) => {
    const key = event.chat_id * 1000000 + event.user_id;

    if (event.is_typing) {
      const existing = this.typingUsers.get(key);
      if (existing) clearTimeout(existing.timeout);

      const timeout = setTimeout(() => {
        runInAction(() => this.typingUsers.delete(key));
      }, 4000);

      runInAction(() => {
        this.typingUsers.set(key, { userId: event.user_id, timeout });
      });
    } else {
      const existing = this.typingUsers.get(key);
      if (existing) clearTimeout(existing.timeout);
      runInAction(() => this.typingUsers.delete(key));
    }
  };

  private handleUserStatus = (event: WsUserStatus) => {
    runInAction(() => {
      chatListStore.chats.forEach(chat => {
        if (chat.other_user?.id === event.user_id) {
          chat.other_user.last_seen_at = event.status === 'online' ? new Date().toISOString() : event.last_seen_at;
        }
      });

      if (activeChatStore.chat?.other_user?.id === event.user_id) {
        activeChatStore.chat.other_user.last_seen_at = event.status === 'online' ? new Date().toISOString() : event.last_seen_at;
      }
    });
  };

  private handleMessageUpdated = (event: { chat_id: number; message_id: number; content: string }) => {
    if (activeChatStore.chatId !== event.chat_id) return;
    runInAction(() => {
      const msg = activeChatStore.messages.find(m => m.id === event.message_id);
      if (msg) {
        msg.content = event.content;
        msg.edited_at = new Date().toISOString();
      }
    });
  };

  private handleMessageDeleted = (event: { chat_id: number; message_id: number }) => {
    if (activeChatStore.chatId !== event.chat_id) return;
    runInAction(() => {
      const msg = activeChatStore.messages.find(m => m.id === event.message_id);
      if (msg) msg.is_deleted = true;
    });
  };

  private handleReaction = (event: { type: string; chat_id: number; message_id: number; user_id: number; reaction: string }) => {
    if (activeChatStore.chatId !== event.chat_id) return;
    runInAction(() => {
      const msg = activeChatStore.messages.find(m => m.id === event.message_id);
      if (!msg) return;

      if (event.type === 'reaction_added') {
        msg.reactions.push({
          id: Date.now(),
          message_id: event.message_id,
          user_id: event.user_id,
          user_name: '',
          reaction: event.reaction,
          created_at: new Date().toISOString(),
        });
      } else {
        msg.reactions = msg.reactions.filter(
          r => !(r.user_id === event.user_id && r.reaction === event.reaction)
        );
      }
    });
  };
}

export const wsStore = new WsStore();
