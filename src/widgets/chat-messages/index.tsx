'use client';

import { chatApi } from '@/entities/chat/api';
import {
  getCachedChatMediaBlob,
  resolveChatMediaUrl,
  warmChatMediaCacheFromUrl,
} from '@/entities/chat/lib/chat-media-cache';
import {
  compressChatImageFile,
  compressChatVideoFile,
  getChatVideoMetadata,
  type ChatVideoMetadata,
  type ChatVideoQualityPreset,
} from '@/entities/chat/lib/chat-media-preprocess';
import { ChatVideoPrepareModal } from '@/entities/chat/ui/chat-video-prepare-modal';
import { activeChatStore } from '@/entities/chat/model/active-chat-store';
import { wsStore } from '@/entities/chat/model/ws-store';
import { useFileUrl } from '@/entities/chat/lib/use-file-url';
import type { Message, MessageFile } from '@/entities/chat/types';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import { IoSend, IoAttach, IoClose, IoArrowUndo, IoArrowRedo, IoPencil, IoTrash, IoCopy } from 'react-icons/io5';

/** Бекенд хранит UTC без суффикса Z — добавляем чтобы JS парсил корректно */
const parseUTC = (dateStr: string) => new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');

const formatMessageTime = (dateStr: string) =>
  parseUTC(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const formatDateSeparator = (dateStr: string) => {
  const date = parseUTC(dateStr);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const shouldShowDateSeparator = (current: Message, prev: Message | undefined) => {
  if (!prev) return true;
  return parseUTC(current.created_at).toDateString() !== parseUTC(prev.created_at).toDateString();
};

const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in-scale' onClick={onClose}>
      <img // eslint-disable-line @next/next/no-img-element
        src={src}
        alt=''
        className='max-w-[90vw] max-h-[90vh] object-contain animate-fade-in-scale drop-shadow-2xl'
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
};

const VideoItem = ({ file }: { file: MessageFile }) => {
  const thumbnailUrl = useFileUrl(file.id, true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handlePlay = () => {
    if (videoUrl || loading) return;
    setLoading(true);

    getCachedChatMediaBlob(file.id)
      .then(async cachedBlob => {
        if (cachedBlob) {
          const cachedObjectUrl = URL.createObjectURL(cachedBlob);
          objectUrlRef.current = cachedObjectUrl;
          setVideoUrl(cachedObjectUrl);
          setLoading(false);
          return;
        }

        const directUrl = await resolveChatMediaUrl(file.id);
        setVideoUrl(directUrl);
        setLoading(false);
        warmChatMediaCacheFromUrl(file.id, directUrl).catch(() => {});
      })
      .catch(() => setLoading(false));
  };

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        autoPlay
        playsInline
        className='rounded-lg max-h-[300px] w-full object-contain bg-black'
      />
    );
  }

  return (
    <div className='relative rounded-lg overflow-hidden bg-gray-900 cursor-pointer' style={{ aspectRatio: '16/9', minHeight: 120 }} onClick={handlePlay}>
      {thumbnailUrl && (
        <img // eslint-disable-line @next/next/no-img-element
          src={thumbnailUrl} alt={file.file_name} className='w-full h-full object-cover opacity-80'
        />
      )}
      <div className='absolute inset-0 flex items-center justify-center'>
        {loading ? (
          <div className='w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin' />
        ) : (
          <div className='w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm'>
            <div className='w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1' />
          </div>
        )}
      </div>
    </div>
  );
};

const MediaItem = ({ file, onImageClick }: { file: MessageFile; onImageClick?: (url: string) => void }) => {
  const url = useFileUrl(file.id);

  if (file.file_type === 'video') {
    return <VideoItem file={file} />;
  }

  if (!url) {
    return (
      <div className='bg-gray-200 rounded-lg animate-pulse' style={{ aspectRatio: '4/3', minHeight: 120 }} />
    );
  }

  return (
    <img // eslint-disable-line @next/next/no-img-element
      src={url}
      alt={file.file_name}
      onClick={() => onImageClick?.(url)}
      className='rounded-lg max-h-[300px] w-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
    />
  );
};

const MediaGrid = ({ files, onImageClick }: { files: MessageFile[]; onImageClick?: (url: string) => void }) => {
  const media = files.filter(f => f.file_type === 'image' || f.file_type === 'video');
  if (media.length === 0) return null;

  return (
    <div className={`grid gap-1 mb-1 ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {media.map(file => (
        <MediaItem key={file.id} file={file} onImageClick={onImageClick} />
      ))}
    </div>
  );
};

// --- Message Context Menu ---

interface MessageMenuState {
  message: Message;
  x: number;
  y: number;
  isOwn: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

type ComposerAttachmentStatus = 'queued' | 'uploading' | 'failed';

interface ComposerAttachment {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: ComposerAttachmentStatus;
  error: string | null;
}

const MessageContextMenu = ({ state, onClose, otherUserId }: { state: MessageMenuState; onClose: () => void; otherUserId?: number }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { message, isOwn } = state;

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

  const myReactions = new Set(
    message.reactions
      .filter(r => r.user_id !== otherUserId)
      .map(r => r.reaction)
  );

  const handleReaction = async (emoji: string) => {
    if (myReactions.has(emoji)) {
      await chatApi.removeReaction(message.id, emoji).catch(() => {});
    } else {
      await chatApi.addReaction(message.id, emoji).catch(() => {});
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).catch(() => {});
    onClose();
  };

  const actions = [
    { icon: <IoArrowUndo size={15} />, label: 'Ответить', onClick: () => onClose() },
    { icon: <IoCopy size={15} />, label: 'Копировать', onClick: handleCopy },
    { icon: <IoArrowRedo size={15} />, label: 'Переслать', onClick: () => onClose() },
    ...(isOwn ? [
      { icon: <IoPencil size={15} />, label: 'Редактировать', onClick: () => onClose() },
    ] : []),
    ...(isOwn ? [
      { icon: <IoTrash size={15} />, label: 'Удалить', onClick: () => onClose(), danger: true },
    ] : []),
  ];

  return (
    <div
      ref={menuRef}
      className='fixed z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100/50 py-1 min-w-[180px] animate-fade-in-scale'
      style={{ left: state.x, top: state.y }}>
      {/* Quick reactions row */}
      <div className='flex gap-1 px-2 py-1.5 border-b border-gray-100'>
        {QUICK_REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 ${
              myReactions.has(emoji) ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}>
            {emoji}
          </button>
        ))}
      </div>
      {/* Action buttons */}
      {actions.map(action => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
            'danger' in action && action.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
          }`}>
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

const MessageBubble = observer(({ message, isOwn, onImageClick, onContextMenu }: { message: Message; isOwn: boolean; onImageClick?: (url: string) => void; onContextMenu?: (e: React.MouseEvent) => void }) => {
  const getContent = () => {
    if (message.is_deleted) return <span className='italic text-gray-400'>Сообщение удалено</span>;

    switch (message.message_type) {
      case 'text':
      case 'combine':
        return <span className='whitespace-pre-wrap break-words'>{message.content}</span>;
      case 'voice':
        return <span className='italic'>🎤 Голосовое сообщение</span>;
      case 'media':
        return null;
      case 'files':
        return <span className='italic'>📎 {message.content || 'Файлы'}</span>;
      case 'geolocation':
        return <span className='italic'>📍 Геолокация</span>;
      case 'contact':
        return <span className='italic'>👤 Контакт</span>;
      case 'system':
        return <span className='italic text-gray-500'>{message.content}</span>;
      default:
        return <span>{message.content}</span>;
    }
  };

  if (message.message_type === 'system') {
    return (
      <div className='flex justify-center my-2'>
        <span className='text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1'>{message.content}</span>
      </div>
    );
  }

  const hasMedia = message.files.length > 0 &&
    message.files.some(f => f.file_type === 'image' || f.file_type === 'video');

  // Group reactions by emoji
  const groupedReactions: Record<string, number> = {};
  for (const r of message.reactions) {
    groupedReactions[r.reaction] = (groupedReactions[r.reaction] || 0) + 1;
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'} mb-1`}>
      <div
        onContextMenu={onContextMenu}
        className={`max-w-[70%] ${hasMedia ? 'p-1' : 'px-3 py-2'} rounded-2xl text-sm transition-shadow hover:shadow-md ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}>
        {hasMedia && <MediaGrid files={message.files} onImageClick={onImageClick} />}
        {getContent() && <div className={hasMedia ? 'px-2 py-1' : ''}>{getContent()}</div>}
        <div className={`flex items-center gap-1 mt-0.5 ${hasMedia ? 'px-2' : ''} ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
            {formatMessageTime(message.created_at)}
          </span>
          {message.edited_at && (
            <span className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>ред.</span>
          )}
        </div>
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${hasMedia ? 'px-1' : ''}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span key={emoji} className={`text-xs rounded-full px-1.5 py-0.5 animate-pop-in cursor-pointer hover:scale-110 transition-transform ${
                isOwn ? 'bg-blue-400/40' : 'bg-gray-200'
              }`}>
                {emoji}{count > 1 ? ` ${count}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const ChatHeader = observer(() => {
  const { chat } = activeChatStore;
  if (!chat) return null;

  const name = chat.other_user?.name ?? chat.name ?? 'Чат';
  const avatar = chat.other_user?.avatar_url;
  const lastSeen = chat.other_user?.last_seen_at;

  const typingUsers = chat.id ? wsStore.getTypingUsersForChat(chat.id) : [];
  const isTyping = typingUsers.length > 0;

  // Онлайн если last_seen_at свежее 60 секунд
  const isOnline = chat.other_user && lastSeen
    ? (Date.now() - parseUTC(lastSeen).getTime()) < 60000
    : false;

  const getStatus = () => {
    if (isTyping) return null; // handled separately with animated dots
    if (isOnline) return 'в сети';
    if (!lastSeen) return '';
    const date = parseUTC(lastSeen);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 60) return `был(а) ${diffMin} мин. назад`;
    return `был(а) ${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const statusText = getStatus();
  const statusColor = isTyping ? 'text-blue-500' : isOnline ? 'text-green-500' : 'text-gray-400';

  return (
    <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-100'>
      <div className='relative w-9 h-9 shrink-0'>
        <div className='w-9 h-9 rounded-full bg-gray-200 overflow-hidden'>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className='w-full h-full object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium'>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {isOnline && (
          <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse-dot' />
        )}
      </div>
      <div className='min-w-0'>
        <p className='text-sm font-medium text-gray-900 truncate'>{name}</p>
        {isTyping ? (
          <div className='flex items-center gap-1'>
            <span className='text-xs text-blue-500'>печатает</span>
            <span className='flex gap-0.5 mt-0.5'>
              <span className='w-1 h-1 bg-blue-500 rounded-full animate-typing-bounce-1' />
              <span className='w-1 h-1 bg-blue-500 rounded-full animate-typing-bounce-2' />
              <span className='w-1 h-1 bg-blue-500 rounded-full animate-typing-bounce-3' />
            </span>
          </div>
        ) : statusText ? (
          <p className={`text-xs ${statusColor}`}>{statusText}</p>
        ) : null}
      </div>
    </div>
  );
});

const formatUploadProgress = (progress: number) => `${Math.round(progress * 100)}%`;

const buildComposerAttachment = (file: File): ComposerAttachment => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
  file,
  previewUrl: URL.createObjectURL(file),
  progress: 0,
  status: 'queued',
  error: null,
});

const FilePreview = ({
  attachment,
  onRemove,
  disabled,
}: {
  attachment: ComposerAttachment;
  onRemove: () => void;
  disabled?: boolean;
}) => {
  const isVideo = attachment.file.type.startsWith('video/');
  const showProgress = attachment.status === 'uploading';
  const showError = attachment.status === 'failed';

  return (
    <div className='relative group w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 animate-pop-in'>
      {isVideo ? (
        <video src={attachment.previewUrl} className='w-full h-full object-cover' />
      ) : (
        <img // eslint-disable-line @next/next/no-img-element
          src={attachment.previewUrl} alt={attachment.file.name} className='w-full h-full object-cover'
        />
      )}
      {(showProgress || showError) && (
        <div className='absolute inset-0 bg-black/55 flex flex-col items-center justify-center px-1 text-white'>
          {showProgress ? (
            <>
              <div className='w-10 h-1.5 rounded-full bg-white/25 overflow-hidden mb-1'>
                <div
                  className='h-full bg-white transition-all duration-200'
                  style={{ width: `${Math.max(6, attachment.progress * 100)}%` }}
                />
              </div>
              <span className='text-[10px] font-medium'>{formatUploadProgress(attachment.progress)}</span>
            </>
          ) : null}
          {showError ? (
            <span className='text-[10px] text-center leading-tight px-1'>
              {attachment.error || 'Ошибка'}
            </span>
          ) : null}
        </div>
      )}
      <button
        onClick={onRemove}
        disabled={disabled}
        className='absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'>
        <IoClose size={10} className='text-white' />
      </button>
    </div>
  );
};

const MessageInput = observer(() => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPreparingMedia, setIsPreparingMedia] = useState(false);
  const [videoQueue, setVideoQueue] = useState<File[]>([]);
  const [videoModalFile, setVideoModalFile] = useState<File | null>(null);
  const [videoModalMetadata, setVideoModalMetadata] = useState<ChatVideoMetadata | null>(null);
  const [videoModalProcessing, setVideoModalProcessing] = useState(false);
  const [videoModalProgress, setVideoModalProgress] = useState(0);
  const [videoModalError, setVideoModalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingSentRef = useRef(0);
  const attachmentsRef = useRef<ComposerAttachment[]>([]);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach(attachment => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (videoModalFile || videoQueue.length === 0) return;

    const [nextVideo, ...restQueue] = videoQueue;
    setVideoModalFile(nextVideo);
    setVideoQueue(restQueue);
    setVideoModalMetadata(null);
    setVideoModalProgress(0);
    setVideoModalError(null);
  }, [videoModalFile, videoQueue]);

  useEffect(() => {
    if (!videoModalFile) return;

    let cancelled = false;
    getChatVideoMetadata(videoModalFile)
      .then(metadata => {
        if (!cancelled) {
          setVideoModalMetadata(metadata);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVideoModalError('Не удалось прочитать параметры видео');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videoModalFile]);

  const canSend = (text.trim() || attachments.length > 0) && !isPreparingMedia && !videoModalFile;

  const appendPreparedFiles = useCallback((incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return;

    setAttachments(prev => {
      const remainingSlots = Math.max(0, 9 - prev.length);
      const nextItems = incomingFiles.slice(0, remainingSlots).map(buildComposerAttachment);
      return [...prev, ...nextItems];
    });
    setSendError(null);
  }, []);

  const appendFiles = useCallback(async (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return;

    const remainingSlots = Math.max(0, 9 - attachmentsRef.current.length);
    const limitedFiles = incomingFiles.slice(0, remainingSlots);
    const imageFiles = limitedFiles.filter(file => file.type.startsWith('image/'));
    const videoFiles = limitedFiles.filter(file => file.type.startsWith('video/'));

    setSendError(null);

    if (imageFiles.length > 0) {
      setIsPreparingMedia(true);
      try {
        const preparedImages = await Promise.all(
          imageFiles.map(async file => {
            try {
              return await compressChatImageFile(file);
            } catch {
              return file;
            }
          }),
        );
        appendPreparedFiles(preparedImages);
      } finally {
        setIsPreparingMedia(false);
      }
    }

    if (videoFiles.length > 0) {
      setVideoQueue(prev => [...prev, ...videoFiles]);
    }
  }, [appendPreparedFiles]);

  const handleSend = async () => {
    if (!canSend || sending) return;

    const content = text.trim();
    const filesToSend = attachments.map(item => item.file);

    setSending(true);
    setSendError(null);
    setAttachments(prev =>
      prev.map(item => ({
        ...item,
        progress: 0,
        status: 'uploading',
        error: null,
      })),
    );

    try {
      await activeChatStore.sendMessage(
        content,
        filesToSend.length > 0 ? filesToSend : undefined,
        (file, progress) => {
          setAttachments(prev =>
            prev.map(item =>
              item.file === file
                ? {
                    ...item,
                    progress,
                    status: 'uploading',
                    error: null,
                  }
                : item,
            ),
          );
        },
      );

      attachments.forEach(attachment => URL.revokeObjectURL(attachment.previewUrl));
      setText('');
      setAttachments([]);
    } catch {
      setAttachments(prev =>
        prev.map(item => ({
          ...item,
          status: 'failed',
          error: 'Не удалось загрузить',
        })),
      );
      setSendError('Не удалось отправить сообщение. Попробуй ещё раз.');
    } finally {
      setSending(false);
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageFiles = items
      .filter(item => item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter((f): f is File => f !== null);

    void appendFiles(imageFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    void appendFiles(selected);
    e.target.value = '';
  };

  const removeFile = (attachmentId: string) => {
    setAttachments(prev => {
      const itemToRemove = prev.find(item => item.id === attachmentId);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter(item => item.id !== attachmentId);
    });
  };

  const handleVideoModalCancel = () => {
    if (videoModalProcessing) return;
    setVideoModalFile(null);
    setVideoModalMetadata(null);
    setVideoModalProgress(0);
    setVideoModalError(null);
  };

  const handleVideoModalConfirm = async (quality: ChatVideoQualityPreset) => {
    if (!videoModalFile) return;

    setVideoModalProcessing(true);
    setVideoModalProgress(0);
    setVideoModalError(null);

    try {
      const preparedVideo = await compressChatVideoFile(
        videoModalFile,
        quality,
        progress => setVideoModalProgress(progress),
      );
      appendPreparedFiles([preparedVideo]);
      setVideoModalFile(null);
      setVideoModalMetadata(null);
      setVideoModalProgress(0);
    } catch (error) {
      console.error('[chat-video-prepare-modal] failed to prepare video', error);
      setVideoModalError(
        error instanceof Error
          ? error.message
          : 'Не удалось подготовить видео. Попробуй ещё раз или выбери другое качество.',
      );
    } finally {
      setVideoModalProcessing(false);
    }
  };

  return (
    <div className='px-4 py-3 border-t border-gray-100'>
      {attachments.length > 0 && (
        <div className='flex gap-2 mb-2 overflow-x-auto pb-1'>
          {attachments.map(attachment => (
            <FilePreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeFile(attachment.id)}
              disabled={sending}
            />
          ))}
        </div>
      )}
      {sendError ? (
        <p className='text-[11px] text-red-500 mb-2'>{sendError}</p>
      ) : null}
      {isPreparingMedia ? (
        <p className='text-[11px] text-gray-500 mb-2'>Подготавливаем фото перед отправкой...</p>
      ) : null}
      {videoQueue.length > 0 && !videoModalFile ? (
        <p className='text-[11px] text-gray-500 mb-2'>Видео в очереди на подготовку: {videoQueue.length}</p>
      ) : null}
      <div className='flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200'>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || isPreparingMedia || videoModalProcessing}
          className='shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
          <IoAttach size={18} />
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*,video/*'
          multiple
          onChange={handleFileSelect}
          className='hidden'
        />
        <textarea
          ref={textareaRef}
          value={text}
          disabled={sending || videoModalProcessing}
          onChange={e => {
            setText(e.target.value);
            const chatId = activeChatStore.chatId;
            if (chatId && Date.now() - lastTypingSentRef.current > 3000) {
              lastTypingSentRef.current = Date.now();
              wsStore.sendTyping(chatId);
            }
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder='Написать сообщение...'
          rows={1}
          className='flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none leading-5 py-0 m-0 block max-h-[160px]'
          style={{ verticalAlign: 'middle' }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend || sending}
          className={`shrink-0 self-end w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            canSend
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-90 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]'
              : 'bg-gray-200 text-gray-400'
          }`}>
          <IoSend size={14} />
        </button>
      </div>
      <p className='text-[10px] text-gray-300 text-center mt-1'>Enter — отправить, Shift+Enter — новая строка</p>
      <ChatVideoPrepareModal
        open={Boolean(videoModalFile)}
        file={videoModalFile}
        metadata={videoModalMetadata}
        processing={videoModalProcessing}
        progress={videoModalProgress}
        error={videoModalError}
        onCancel={handleVideoModalCancel}
        onConfirm={handleVideoModalConfirm}
      />
    </div>
  );
});

export const ChatMessages = observer(() => {
  const { chat, messages, loading, loadingMore, hasMore } = activeChatStore;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLenRef = useRef(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [messageMenu, setMessageMenu] = useState<MessageMenuState | null>(null);

  const otherUserId = chat?.other_user?.id;

  const handleMessageContextMenu = useCallback((e: React.MouseEvent, msg: Message, isOwn: boolean) => {
    e.preventDefault();
    if (msg.is_deleted) return;
    setMessageMenu({ message: msg, x: e.clientX, y: e.clientY, isOwn });
  }, []);

  // Scroll to bottom on initial load, chat switch, or new messages sent
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const wasEmpty = prevMessagesLenRef.current === 0;
      const hasNewMessages = messages.length > prevMessagesLenRef.current;
      if (wasEmpty || hasNewMessages) {
        messagesEndRef.current?.scrollIntoView({ behavior: wasEmpty ? 'auto' : 'smooth' });
      }
    }
    prevMessagesLenRef.current = messages.length;
  }, [loading, messages.length]);

  // Reset ref on chat switch
  useEffect(() => {
    prevMessagesLenRef.current = 0;
  }, [chat?.id]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    if (container.scrollTop < 100 && hasMore && !loadingMore) {
      activeChatStore.loadOlderMessages();
    }
  };

  if (!chat) {
    return (
      <div className='flex-1 h-full flex flex-col items-center justify-center border-l border-gray-100'>
        <div className='w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 animate-pulse-glow'>
          <BsChatDots className='text-blue-400' size={24} />
        </div>
        <p className='text-gray-400 text-sm'>Выберите чат</p>
      </div>
    );
  }

  return (
    <div className='flex-1 h-full flex flex-col border-l border-gray-100 overflow-hidden'>
      <ChatHeader />

      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto px-4 py-3'>
        {loadingMore && (
          <div className='flex justify-center py-3'>
            <div className='w-5 h-5 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin' />
          </div>
        )}

        {loading ? (
          <div className='flex-1 flex items-center justify-center py-20'>
            <div className='w-6 h-6 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex-1 flex flex-col items-center justify-center py-20'>
            <p className='text-sm text-gray-400'>Нет сообщений</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id}>
              {shouldShowDateSeparator(msg, messages[i - 1]) && (
                <div className='flex justify-center my-4 animate-fade-in-scale'>
                  <span className='text-xs text-gray-400 bg-gray-50/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm'>
                    {formatDateSeparator(msg.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.sender_id !== otherUserId}
                onImageClick={setLightboxSrc}
                onContextMenu={e => handleMessageContextMenu(e, msg, msg.sender_id !== otherUserId)}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      {messageMenu && (
        <MessageContextMenu
          state={messageMenu}
          onClose={() => setMessageMenu(null)}
          otherUserId={otherUserId}
        />
      )}
    </div>
  );
});
