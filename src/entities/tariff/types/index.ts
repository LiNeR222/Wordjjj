export interface Tariff {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  commission: number;
  active: boolean;
  billing_period_days: number;
  storage_price_gb: number;
  created_at: string;
}

export interface WalletSurvivalInfo {
  channel_id: number;
  wallet_id: number;
  current_balance: number;
  daily_storage_cost: number;
  days_remaining: number;
  total_storage_gb: number;
} 