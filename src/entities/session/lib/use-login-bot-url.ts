'use client';

import { useLoginBotUrls } from './use-login-bot-urls';

export const useLoginBotUrl = (sessionId?: string) => {
  const loginUrls = useLoginBotUrls(sessionId);
  return loginUrls?.telegram ?? null;
};
