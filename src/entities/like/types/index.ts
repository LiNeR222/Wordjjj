export type LikeStatus = 'like' | 'dislike' | 'null'; 


export interface VideoLikes {
  count_dislikes: number;
  count_likes: number;
  status: LikeStatus;
}

export interface PutLikeResponse {
  videoId: number;
  status: LikeStatus;
}
