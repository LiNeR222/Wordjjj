export type UserProfile = {
  id?: number;
  telegram_id?: number;
  name: string;
  phone: string;
  profile_picture: string;
  is_pro?: boolean;
};

export type UserResponse = {
  name: string;
  phone: string;
  profile_picture: string;
  is_pro?: boolean;
};

export interface UserSearchResult {
  id: number;
  name: string;
  telegram_username: string | null;
  avatar: string;
  registered_at: string | null;
  last_seen_at: string | null;
  is_pro: boolean;
}

export interface UserSearchResponse {
  total: number;
  offset: number;
  limit: number;
  count: number;
  items: UserSearchResult[];
}
