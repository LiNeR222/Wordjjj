export type SaveTokenResponse = {
  success: boolean;
  access_token: string;
};

export interface Tokens {
  access_token: string;
  refresh_token: string;
}
