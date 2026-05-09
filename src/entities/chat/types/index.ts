export type ChatType = 'p2p' | 'group' | 'channel';

export type MessageType = 'text' | 'media' | 'combine' | 'files' | 'voice' | 'geolocation' | 'contact' | 'system';
export type FileUploadMethod = 'single' | 'multipart';

export type InboxReason = 'pro' | 'contact' | 'replied' | 'initiated';

export interface OtherUser {
  id: number;
  name: string;
  avatar_url: string;
  chatting_nickname: string | null;
  registered_at: string | null;
  last_seen_at: string | null;
  is_pro: boolean;
}

export interface LastMessage {
  id: number;
  sender_id: number;
  content: string;
  video_id: number | null;
  nomenclature_id: string | null;
  forwarded_from_id: number | null;
  file_ids: number[];
  created_at: string;
  is_read: boolean;
}

export interface ChatTag {
  id: number;
  tag_name: string;
  tag_color: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  type: ChatType;
  name: string | null;
  avatar_url: string | null;
  other_user: OtherUser | null;
  last_message: LastMessage | null;
  unread_count: number;
  is_in_inbox: boolean;
  is_marked_unread: boolean;
  is_pinned: boolean;
  is_muted: boolean;
  mute_until: string | null;
  inbox_reason: InboxReason | null;
  created_at: string;
  updated_at: string;
  tags: ChatTag[];
  found_message: LastMessage | null;
  total_matches_in_chat: number | null;
}

export interface ChatListResponse {
  count: number;
  chats: Chat[];
}

export interface ChatListParams {
  is_in_inbox?: boolean;
  offset?: number;
  limit?: number;
  search?: string;
}

export interface MessageFile {
  id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  thumbnail_url: string | null;
  blur_hash: string | null;
}

export interface ChatFileDownloadUrlResponse {
  url: string;
  expires_at: string;
  file_name: string;
  thumbnail: boolean;
}

export interface ChatFileUploadInitResponse {
  file_id: number;
  upload_method: FileUploadMethod;
  upload_url: string | null;
  expires_at: string;
  method: string;
  file_name: string;
  file_type: string;
  mime_type: string | null;
  multipart_upload_id: string | null;
  part_size: number | null;
  total_parts: number | null;
}

export interface ChatFileMultipartPartUrlResponse {
  file_id: number;
  multipart_upload_id: string;
  part_number: number;
  upload_url: string;
  expires_at: string;
  method: string;
}

export interface ChatFileMultipartCompletePart {
  part_number: number;
  etag: string;
}

export interface ChatFileUploadCompleteResponse {
  file_id: number;
  upload_status: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  user_name: string;
  reaction: string;
  created_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  content: string;
  message_type: MessageType;
  reply_to_id: number | null;
  forwarded_from_id: number | null;
  video_id: number | null;
  nomenclature_id: string | null;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  reactions: MessageReaction[];
  files: MessageFile[];
}

export interface MessageListResponse {
  count: number;
  messages: Message[];
}

// --- WebSocket event types ---

export interface WsNewMessage {
  type: 'new_message';
  message_id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: MessageType;
  reply_to_id: number | null;
  video_id: number | null;
  nomenclature_id: string | null;
}

export interface WsTyping {
  type: 'typing';
  chat_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WsUserStatus {
  type: 'user_status';
  user_id: number;
  status: 'online' | 'offline';
  last_seen_at: string | null;
}

export interface WsMessageRead {
  type: 'message_read';
  chat_id: number;
  user_id: number;
  last_read_message_id: number;
}

export interface WsMessageUpdated {
  type: 'message_updated';
  message_id: number;
  content: string;
  chat_id: number;
}

export interface WsMessageDeleted {
  type: 'message_deleted';
  message_id: number;
  chat_id: number;
}

export interface WsReaction {
  type: 'reaction_added' | 'reaction_removed';
  message_id: number;
  user_id: number;
  reaction: string;
  chat_id: number;
}

export type WsEvent =
  | WsNewMessage
  | WsTyping
  | WsUserStatus
  | WsMessageRead
  | WsMessageUpdated
  | WsMessageDeleted
  | WsReaction;
