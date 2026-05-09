export interface AuthContextType {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Session {
  id: string;
  lifetime_minutes: number;
  auth?: boolean;
  expires_at?: string;
  created_at?: string;
  tg_id?: string | null;
}
