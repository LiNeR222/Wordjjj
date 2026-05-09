import { makeAutoObservable, runInAction } from 'mobx';
import { chatApi } from '../api';
import type { Chat } from '../types';

export class ChatListStore {
  chats: Chat[] = [];
  totalCount: number = 0;
  loading: boolean = false;
  error: string | null = null;
  isInbox: boolean = true;
  search: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setIsInbox = (value: boolean) => {
    this.isInbox = value;
    this.fetchChats();
  };

  setSearch = (value: string) => {
    this.search = value;
    this.fetchChats();
  };

  fetchChats = async () => {
    this.loading = true;
    this.error = null;

    try {
      const res = await chatApi.getChats({
        is_in_inbox: this.isInbox,
        search: this.search || undefined,
      });

      runInAction(() => {
        this.chats = res.chats;
        this.totalCount = res.count;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = 'Не удалось загрузить чаты';
        this.loading = false;
      });
    }
  };

  private updateChat = (chatId: number, updater: (chat: Chat) => Chat) => {
    this.chats = this.chats.map(c => (c.id === chatId ? updater(c) : c));
  };

  private removeChat = (chatId: number) => {
    this.chats = this.chats.filter(c => c.id !== chatId);
    this.totalCount = Math.max(0, this.totalCount - 1);
  };

  togglePin = async (chat: Chat) => {
    try {
      if (chat.is_pinned) {
        await chatApi.unpinChat(chat.id);
      } else {
        await chatApi.pinChat(chat.id);
      }
      await this.fetchChats();
    } catch {
      runInAction(() => this.fetchChats());
    }
  };

  toggleMute = async (chat: Chat) => {
    const wasMuted = chat.is_muted;
    this.updateChat(chat.id, c => ({ ...c, is_muted: !wasMuted, mute_until: null }));

    try {
      if (wasMuted) {
        await chatApi.unmuteChat(chat.id);
      } else {
        await chatApi.muteChat(chat.id);
      }
    } catch {
      runInAction(() => this.updateChat(chat.id, c => ({ ...c, is_muted: wasMuted })));
    }
  };

  toggleMarkUnread = async (chat: Chat) => {
    const wasUnread = chat.is_marked_unread;
    this.updateChat(chat.id, c => ({ ...c, is_marked_unread: !wasUnread }));

    try {
      if (wasUnread) {
        await chatApi.markRead(chat.id);
      } else {
        await chatApi.markUnread(chat.id);
      }
    } catch {
      runInAction(() => this.updateChat(chat.id, c => ({ ...c, is_marked_unread: wasUnread })));
    }
  };

  archiveChat = async (chat: Chat) => {
    this.removeChat(chat.id);

    try {
      if (this.isInbox) {
        await chatApi.archiveChat(chat.id);
      } else {
        await chatApi.unarchiveChat(chat.id);
      }
    } catch {
      runInAction(() => this.fetchChats());
    }
  };

  blockChat = async (chat: Chat) => {
    this.removeChat(chat.id);

    try {
      await chatApi.blockChat(chat.id);
    } catch {
      runInAction(() => this.fetchChats());
    }
  };

  deleteChat = async (chat: Chat) => {
    this.removeChat(chat.id);

    try {
      await chatApi.deleteChat(chat.id);
    } catch {
      runInAction(() => this.fetchChats());
    }
  };
}

export const chatListStore = new ChatListStore();
