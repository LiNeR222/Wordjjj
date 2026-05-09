'use client';

import { activeChatStore } from '@/entities/chat/model/active-chat-store';
import { chatApi } from '@/entities/chat/api';
import { chatListStore } from '@/entities/chat/model/chat-list-store';
import type { Chat } from '@/entities/chat/types';
import { tokenStore } from '@/entities/token/model';
import { userApi } from '@/entities/user/api';
import type { UserSearchResult } from '@/entities/user/types';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import {
  IoArchiveOutline,
  IoBanOutline,
  IoClose,
  IoCreateOutline,
  IoNotificationsOffOutline,
  IoNotificationsOutline,
  IoSearchOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { TbPin, TbPinFilled, TbMailOpened, TbMail } from 'react-icons/tb';

// --- Context Menu ---

interface ContextMenuState {
  chat: Chat;
  x: number;
  y: number;
}

const ChatContextMenu = ({ state, onClose }: { state: ContextMenuState; onClose: () => void }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { chat } = state;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const actions = [
    {
      icon: chat.is_pinned ? <TbPinFilled size={16} /> : <TbPin size={16} />,
      label: chat.is_pinned ? 'Открепить' : 'Закрепить',
      onClick: () => chatListStore.togglePin(chat),
    },
    {
      icon: chat.is_marked_unread ? <TbMailOpened size={16} /> : <TbMail size={16} />,
      label: chat.is_marked_unread ? 'Отметить прочитанным' : 'Отметить непрочитанным',
      onClick: () => chatListStore.toggleMarkUnread(chat),
    },
    {
      icon: chat.is_muted ? <IoNotificationsOutline size={16} /> : <IoNotificationsOffOutline size={16} />,
      label: chat.is_muted ? 'Включить уведомления' : 'Отключить уведомления',
      onClick: () => chatListStore.toggleMute(chat),
    },
    {
      icon: <IoArchiveOutline size={16} />,
      label: chatListStore.isInbox ? 'Архивировать' : 'В инбокс',
      onClick: () => chatListStore.archiveChat(chat),
    },
    'separator' as const,
    {
      icon: <IoBanOutline size={16} />,
      label: 'Заблокировать',
      onClick: () => chatListStore.blockChat(chat),
      danger: true,
    },
    {
      icon: <IoTrashOutline size={16} />,
      label: 'Удалить чат',
      onClick: () => chatListStore.deleteChat(chat),
      danger: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className='fixed z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100/50 py-1 min-w-[200px] animate-fade-in-scale'
      style={{ left: state.x, top: state.y }}>
      {actions.map((action, i) =>
        action === 'separator' ? (
          <div key={`sep-${i}`} className='my-1 mx-4 h-px bg-gray-100' />
        ) : (
          <button
            key={action.label}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
              action.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
            }`}>
            {action.icon}
            {action.label}
          </button>
        )
      )}
    </div>
  );
};

// --- Chat Item ---

const ChatItem = observer(({ chat, onContextMenu }: { chat: Chat; onContextMenu: (e: React.MouseEvent, chat: Chat) => void }) => {
  const name = chat.other_user?.name ?? chat.name ?? 'Чат';
  const avatar = chat.other_user?.avatar_url;
  const lastMsg = chat.last_message;
  const hasUnread = chat.unread_count > 0 || chat.is_marked_unread;
  const isSelected = activeChatStore.chatId === chat.id;

  const getPreview = () => {
    if (!lastMsg) return 'Нет сообщений';
    return lastMsg.content || 'Медиа';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      onClick={() => activeChatStore.selectChat(chat)}
      onContextMenu={e => onContextMenu(e, chat)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 hover:-translate-y-[1px] hover:shadow-sm ${
        isSelected
          ? 'bg-blue-50 hover:bg-blue-100/70'
          : chat.is_pinned
            ? 'bg-blue-50/30 hover:bg-blue-50/60'
            : 'hover:bg-gray-50'
      }`}>
      {/* Avatar */}
      <div className='relative w-10 h-10 min-w-[40px]'>
        <div className='w-10 h-10 rounded-full bg-gray-200 overflow-hidden'>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className='w-full h-full object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium'>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {chat.other_user?.last_seen_at && (Date.now() - new Date(chat.other_user.last_seen_at.endsWith('Z') ? chat.other_user.last_seen_at : chat.other_user.last_seen_at + 'Z').getTime()) < 60000 && (
          <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse-dot' />
        )}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
            {name}
          </span>
          <div className='flex items-center gap-1.5 ml-2 shrink-0'>
            {chat.is_muted && <IoNotificationsOffOutline size={12} className='text-gray-400' />}
            {chat.is_pinned && <TbPinFilled size={12} className='text-gray-400' />}
            {lastMsg && <span className='text-xs text-gray-400'>{formatTime(lastMsg.created_at)}</span>}
          </div>
        </div>
        <div className='flex items-center justify-between mt-0.5'>
          <p className={`text-xs truncate ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>{getPreview()}</p>
          {chat.unread_count > 0 && (
            <span className='ml-2 shrink-0 bg-blue-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse-glow'>
              {chat.unread_count}
            </span>
          )}
          {chat.unread_count === 0 && chat.is_marked_unread && (
            <span className='ml-2 shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500' />
          )}
        </div>
      </div>
    </div>
  );
});

// --- New Chat Modal ---

const NewChatModal = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await userApi.searchUsers(value.trim());
        setResults(res.items);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 300);
  };

  const handleSelectUser = async (user: UserSearchResult) => {
    if (sending) return;
    setSending(true);

    try {
      // Отправляем пустое приветственное сообщение для создания чата
      await chatApi.sendMessage(user.id, '👋');
      await chatListStore.fetchChats();
      // Выбираем новый чат
      const newChat = chatListStore.chats.find(c => c.other_user?.id === user.id);
      if (newChat) activeChatStore.selectChat(newChat);
      onClose();
    } catch {
      setSending(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]' onClick={onClose}>
      <div
        className='bg-white rounded-2xl shadow-2xl w-[400px] max-h-[60vh] flex flex-col overflow-hidden animate-fade-in-scale'
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
          <h3 className='text-sm font-semibold text-gray-900'>Новый чат</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <IoClose size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className='px-4 py-3'>
          <div className='relative'>
            <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
            <input
              ref={inputRef}
              type='text'
              placeholder='Поиск по имени или никнейму...'
              value={query}
              onChange={e => handleSearch(e.target.value)}
              className='w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors'
            />
          </div>
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto'>
          {searching ? (
            <div className='flex items-center justify-center py-8'>
              <div className='w-5 h-5 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin' />
            </div>
          ) : results.length > 0 ? (
            results.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                disabled={sending}
                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50'>
                <div className='w-10 h-10 min-w-[40px] rounded-full bg-gray-200 overflow-hidden'>
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium'>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className='min-w-0 text-left'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {user.name}
                    {user.is_pro && <span className='ml-1 text-[10px] text-blue-500 font-semibold'>PRO</span>}
                  </p>
                  {user.telegram_username && (
                    <p className='text-xs text-gray-400 truncate'>@{user.telegram_username}</p>
                  )}
                </div>
              </button>
            ))
          ) : query.trim() ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <p className='text-sm text-gray-400'>Пользователи не найдены</p>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-8'>
              <p className='text-sm text-gray-400'>Начните вводить имя или никнейм</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sidebar ---

export const ChatSidebar = observer(() => {
  const { chats, totalCount, loading, isInbox, search } = chatListStore;
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (tokenStore.isAuth) {
      chatListStore.fetchChats();
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    setContextMenu({ chat, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  return (
    <div className='w-[320px] min-w-[320px] h-full flex flex-col border-r border-gray-100'>
      {/* Search */}
      <div className='p-3 pb-2'>
        <div className='relative'>
          <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
          <input
            type='text'
            placeholder='Поиск чатов...'
            value={search}
            onChange={e => chatListStore.setSearch(e.target.value)}
            className='w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors'
          />
        </div>
      </div>

      {/* Inbox / Archive tabs */}
      <div className='px-3 pb-2'>
        <div className='flex bg-gray-50 rounded-lg p-0.5'>
          <button
            onClick={() => chatListStore.setIsInbox(true)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isInbox ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            Входящие
          </button>
          <button
            onClick={() => chatListStore.setIsInbox(false)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              !isInbox ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            Архив
          </button>
        </div>
      </div>

      {/* Chat count header */}
      <div className='flex items-center justify-between px-4 py-2 border-b border-gray-100'>
        <span className='text-sm font-medium text-gray-700'>{isInbox ? 'Все чаты' : 'Архив'}</span>
        <span className='text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5'>{totalCount}</span>
      </div>

      {/* Chat list */}
      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className='flex items-center justify-center py-10'>
            <div className='w-6 h-6 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin' />
          </div>
        ) : chats.length > 0 ? (
          <div className='divide-y divide-gray-50'>
            {chats.map(chat => (
              <ChatItem key={chat.id} chat={chat} onContextMenu={handleContextMenu} />
            ))}
          </div>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center px-6 py-16'>
            <div className='w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 animate-pulse-glow'>
              <BsChatDots className='text-blue-400' size={28} />
            </div>
            <p className='text-sm font-medium text-gray-800 mb-1'>Чаты не найдены</p>
            <p className='text-xs text-gray-400 text-center'>
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        )}
      </div>

      {/* New chat button */}
      <div className='relative p-3 pt-0'>
        <button
          onClick={() => setShowNewChat(true)}
          className='absolute bottom-6 right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all duration-200 active:scale-90'>
          <IoCreateOutline size={22} />
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && <ChatContextMenu state={contextMenu} onClose={closeContextMenu} />}

      {/* New chat modal */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </div>
  );
});
