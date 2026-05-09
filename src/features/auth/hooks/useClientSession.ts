'use client';

import { cookies } from '@/shared/lib/cookies';
import { useCallback, useEffect, useState } from 'react';
import { AuthContextType, Session } from '../types';

export function useClientSession(state: AuthContextType): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  // Функция для получения сессии из localStorage
  const getStoredSession = useCallback((): Session | null => {
    const stored = localStorage.getItem('session');
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Функция для сохранения сессии в state и localStorage
  const saveSession = useCallback((sess: Session) => {
    setSession(sess);
    localStorage.setItem('session', JSON.stringify(sess));
  }, []);

  // Функция для создания веб-сокет потока
  const initWebSocket = useCallback((sessionId: string) => {
    const ws = new WebSocket(`wss://interesnoitochka.ru/api/v1/ws/ws/session/${sessionId}`);

    ws.onopen = () => {
      console.log('WebSocket соединение установлено:', sessionId);
      // Закрываем соединение через 30 минут
      setTimeout(() => ws.close(), 30 * 60 * 1000);
    };

    ws.onmessage = event => {
      console.log('Получены данные через WebSocket:', event.data);
      try {
        const { access_token, refresh_token } = JSON.parse(event.data);

        cookies.set('token', access_token, { path: '/' });

        fetch('/api/save-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token }),
        })
          .then(async response => {
            if (!response.ok) {
              throw new Error('Ошибка сохранения refresh token');
            }
            return response.json();
          })
          .then(result => {
            console.log('Refresh token сохранён в HttpOnly cookie:', result);
            const storedSession = getStoredSession() || { id: sessionId, lifetime_minutes: 0 };
            saveSession({ ...storedSession, auth: true });

            state?.setShowModal(false);
            ws.close();
          })
          .catch(error => {
            console.error('Ошибка при сохранении refresh token:', error);
          });
      } catch (error) {
        console.error('Ошибка обработки данных WebSocket:', error);
      }
    };

    ws.onerror = error => {
      console.error('Ошибка WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };
  }, []);

  // Функция для создания новой сессии
  const createSession = useCallback(async () => {
    const token = cookies.get('token');
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      const res = await fetch('https://interesnoitochka.ru/api/v1/auth/sessions/new/', {
        method: 'GET',
        headers,
      });

      if (res.status === 401) {
        const tokenRes = await fetch('/api/update-token');
        if (!tokenRes.ok) {
          return createSession();
        }
        const tokenData = await tokenRes.json();
        if (tokenData.success && tokenData.access_token) {
          cookies.set('token', tokenData.access_token, { path: '/' });
          return createSession();
        } else {
          throw new Error('Не удалось обновить токен');
        }
      }

      const data = await res.json();
      console.log('Сессия создана:', data);
      saveSession(data);
      if (!data?.auth) {
        initWebSocket(data.id);
      }
    } catch (error) {
      console.error('Ошибка создания сессии:', error);
    }
  }, []);

  // Функция для обновления жизни сессии
  const updateSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(
        `https://interesnoitochka.ru/api/v1/auth/sessions/session/update-life-time/${sessionId}`,
        {
          method: 'POST',
        }
      );
      if (!res.ok) {
        createSession();
        return;
      }
      const data = await res.json();
      console.log('Сессия обновлена:', data);
      const storedSession = getStoredSession() || { id: sessionId, lifetime_minutes: 0 };
      const updatedSession = { ...storedSession, ...data };
      saveSession(updatedSession);
      // setShowModal(false);
    } catch (error) {
      console.error('Ошибка обновления сессии:', error);
    }
  }, []);

  useEffect(() => {
    const storedSession = getStoredSession();
    const token = cookies.get('token');

    if (storedSession?.id && storedSession?.auth && token) {
      updateSession(storedSession.id);
      return;
    }

    createSession();
  }, []);

  return session;
}
