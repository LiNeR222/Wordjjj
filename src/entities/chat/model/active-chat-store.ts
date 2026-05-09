import { makeAutoObservable, runInAction } from 'mobx';
import { chatApi } from '../api';
import { uploadChatFiles } from '../lib/chat-file-uploader';
import type { Chat, Message, MessageType } from '../types';

export class ActiveChatStore {
  chat: Chat | null = null;
  messages: Message[] = [];
  totalCount: number = 0;
  loading: boolean = false;
  loadingMore: boolean = false;
  hasMore: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  get chatId() {
    return this.chat?.id ?? null;
  }

  selectChat = async (chat: Chat) => {
    if (this.chat?.id === chat.id) return;

    this.chat = chat;
    this.messages = [];
    this.totalCount = 0;
    this.hasMore = true;
    this.loading = true;

    // Clear unread locally immediately
    chat.unread_count = 0;
    chat.is_marked_unread = false;

    try {
      const res = await chatApi.getMessages(chat.id);
      runInAction(() => {
        this.messages = res.messages.reverse();
        this.totalCount = res.count;
        this.hasMore = res.messages.length < res.count;
        this.loading = false;
      });

      // Send read receipt for last message
      if (res.messages.length > 0) {
        const lastMsg = res.messages[0]; // newest before reverse
        chatApi.sendReadReceipt(chat.id, lastMsg.id).catch(() => {});
      }
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  loadOlderMessages = async () => {
    if (!this.chat || this.loadingMore || !this.hasMore) return;

    const oldestMessage = this.messages[0];
    if (!oldestMessage) return;

    this.loadingMore = true;

    try {
      const res = await chatApi.getMessages(this.chat.id, 0, 50, oldestMessage.id);
      runInAction(() => {
        this.messages = [...res.messages.reverse(), ...this.messages];
        this.hasMore = res.messages.length === 50;
        this.loadingMore = false;
      });
    } catch {
      runInAction(() => {
        this.loadingMore = false;
      });
    }
  };

  sendMessage = async (
    content: string,
    files?: File[],
    onFileProgress?: (file: File, progress: number) => void,
  ) => {
    if (!this.chat?.other_user) {
      throw new Error('Chat recipient is not available');
    }

    const recipientId = this.chat.other_user.id;

    let fileIds: number[] | undefined;
    let messageType: MessageType = 'text';

    if (files?.length) {
      fileIds = await uploadChatFiles(files, onFileProgress);
      messageType = content.trim() ? 'combine' : 'media';
    }

    await chatApi.sendMessage(recipientId, content, messageType, fileIds);
    const res = await chatApi.getMessages(this.chat.id);
    runInAction(() => {
      this.messages = res.messages.reverse();
      this.totalCount = res.count;
    });
  };

  clearChat = () => {
    this.chat = null;
    this.messages = [];
    this.totalCount = 0;
    this.hasMore = true;
  };
}

export const activeChatStore = new ActiveChatStore();
