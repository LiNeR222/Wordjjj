'use client';

import { useEffect, useState } from 'react';
import { sessionsApi } from '../api';
import { LoginBotProvider, LoginBotUrls } from '../types';

const appendSessionId = (url: string | null | undefined, sessionId: string) => {
  if (!url) {
    return null;
  }
  return `${url}?start=${sessionId}`;
};

export const useLoginBotUrls = (sessionId?: string) => {
  const [loginUrls, setLoginUrls] = useState<Record<LoginBotProvider, string | null> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!sessionId) {
      setLoginUrls(null);
      return;
    }

    sessionsApi
      .getBotUrls()
      .then((botUrls: LoginBotUrls) => {
        if (!cancelled) {
          setLoginUrls({
            telegram: appendSessionId(botUrls.telegram, sessionId),
            max: appendSessionId(botUrls.max, sessionId),
          });
        }
      })
      .catch(error => {
        console.error('Failed to load login bot urls', error);
        if (!cancelled) {
          setLoginUrls(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return loginUrls;
};
