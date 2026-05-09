import { CommentStore } from '../model/comment-store';

export interface VideoComment {
  id: number;
  response_comment: number | null;
  user_id: number;
  user_name: string;
  user_avatar: string;
  changed: boolean;
  state_comment: 'delete_user' | 'delete_moderator' | 'publication';
  message: string;
  date_publication: string;
}

export interface CommentCreate {
  video_id: number;
  message: string;
  response_comment?: number;
}

export interface CommentGetResponse {
  comments: VideoComment[];
  count_comments: number;
}

export interface CommentsCollection {
  list: CommentStore[];
  count_comments: number;
}

export interface SearchParams {
  offset: number;
  limit: number;
}
