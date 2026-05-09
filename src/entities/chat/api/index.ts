import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl, isServer } from '@/shared/config';
import type {
  ChatFileDownloadUrlResponse,
  ChatFileMultipartCompletePart,
  ChatFileMultipartPartUrlResponse,
  ChatFileUploadCompleteResponse,
  ChatFileUploadInitResponse,
  ChatListParams,
  ChatListResponse,
  MessageFile,
  MessageListResponse,
  MessageType,
} from '../types';

const SERVICE_URL = `${apiUrl}/chats`;

export class ChatApi extends BaseApi {
  getChats = async (params: ChatListParams = {}): Promise<ChatListResponse> =>
    this.privateApi.get(SERVICE_URL, {
      params: {
        is_in_inbox: params.is_in_inbox ?? true,
        offset: params.offset ?? 0,
        limit: params.limit ?? 50,
        ...(params.search ? { search: params.search } : {}),
      },
      cache: { ttl: 0 },
    });

  pinChat = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/pin`);

  unpinChat = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/unpin`);

  muteChat = async (chatId: number, muteUntil?: string): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/mute`, muteUntil ? { mute_until: muteUntil } : {});

  unmuteChat = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/unmute`);

  markUnread = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/mark-unread`);

  markRead = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/mark-read`);

  archiveChat = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/archive`);

  unarchiveChat = async (chatId: number): Promise<void> =>
    this.privateApi.put(`${SERVICE_URL}/${chatId}/inbox`);

  deleteChat = async (chatId: number): Promise<void> =>
    this.privateApi.delete(`${SERVICE_URL}/${chatId}`);

  blockChat = async (chatId: number): Promise<void> =>
    this.privateApi.post(`${SERVICE_URL}/${chatId}/block`);

  unblockChat = async (chatId: number): Promise<void> =>
    this.privateApi.delete(`${SERVICE_URL}/${chatId}/block`);

  sendMessage = async (
    recipientId: number,
    content: string,
    messageType: MessageType = 'text',
    fileIds?: number[],
  ): Promise<{ message_id: number; status: string }> =>
    this.privateApi.post(`${SERVICE_URL}/messages`, {
      recipient_id: recipientId,
      content,
      message_type: messageType,
      ...(fileIds?.length ? { file_ids: fileIds } : {}),
    });

  uploadFiles = async (files: File[]): Promise<MessageFile[]> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.privateApi.post(`${SERVICE_URL}/messages/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  getFileDownloadUrl = async (
    fileId: number,
    thumbnail = false,
  ): Promise<ChatFileDownloadUrlResponse> =>
    this.privateApi.get(`${SERVICE_URL}/files/${fileId}/download-url`, {
      params: thumbnail ? { thumbnail: true } : {},
      cache: { ttl: 0 },
    });

  getFileBlob = async (fileId: number, thumbnail = false): Promise<Blob> =>
    this.privateApi.get(`${SERVICE_URL}/files/${fileId}`, {
      params: thumbnail ? { thumbnail: true } : {},
      responseType: 'blob',
      cache: false,
    } as never) as Promise<Blob>;

  initFileUpload = async (file: File): Promise<ChatFileUploadInitResponse> =>
    this.privateApi.post(`${SERVICE_URL}/files/upload/init`, {
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || null,
    });

  completeFileUpload = async (fileId: number): Promise<ChatFileUploadCompleteResponse> =>
    this.privateApi.post(`${SERVICE_URL}/files/upload/complete`, {
      file_id: fileId,
    });

  getMultipartPartUrl = async (
    fileId: number,
    partNumber: number,
  ): Promise<ChatFileMultipartPartUrlResponse> =>
    this.privateApi.post(`${SERVICE_URL}/files/upload/multipart/part-url`, {
      file_id: fileId,
      part_number: partNumber,
    });

  completeMultipartUpload = async (
    fileId: number,
    parts: ChatFileMultipartCompletePart[],
  ): Promise<ChatFileUploadCompleteResponse> =>
    this.privateApi.post(`${SERVICE_URL}/files/upload/multipart/complete`, {
      file_id: fileId,
      parts,
    });

  abortMultipartUpload = async (fileId: number): Promise<void> =>
    this.privateApi.post(`${SERVICE_URL}/files/upload/multipart/abort`, {
      file_id: fileId,
    });

  sendTyping = async (chatId: number, isTyping: boolean): Promise<void> =>
    this.privateApi.post(`${SERVICE_URL}/${chatId}/typing`, { is_typing: isTyping });

  sendReadReceipt = async (chatId: number, lastReadMessageId: number): Promise<void> =>
    this.privateApi.post(`${SERVICE_URL}/${chatId}/read`, { last_read_message_id: lastReadMessageId });

  addReaction = async (messageId: number, reaction: string): Promise<void> =>
    this.privateApi.post(`${SERVICE_URL}/messages/reactions`, { message_id: messageId, reaction });

  removeReaction = async (messageId: number, reaction: string): Promise<void> =>
    this.privateApi.delete(`${SERVICE_URL}/messages/reactions`, { data: { message_id: messageId, reaction } });

  deleteMessage = async (messageId: number): Promise<void> =>
    this.privateApi.delete(`${SERVICE_URL}/messages/${messageId}`);

  getMessages = async (chatId: number, offset = 0, limit = 50, beforeMessageId?: number): Promise<MessageListResponse> =>
    this.privateApi.get(`${SERVICE_URL}/${chatId}/messages`, {
      params: {
        offset,
        limit,
        ...(beforeMessageId ? { before_message_id: beforeMessageId } : {}),
      },
      cache: { ttl: 0 },
    });
}

export const chatApi = isServer ? ({} as ChatApi) : new ChatApi();
