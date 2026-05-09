export const isMockEnv = process.env.NEXT_PUBLIC_MOCK === 'true';
export const port = process.env.PORT || 3000;
export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'https://interesnoitochka.ru';
export const WS_ORIGIN = process.env.NEXT_PUBLIC_WS_ORIGIN || 'wss://interesnoitochka.ru';

export const baseUrl =  `${BACKEND_ORIGIN}`;
export const apiPath = '/api/v1';
export const apiUrl = `${baseUrl}${apiPath}`;

export const isServer = typeof window === 'undefined';
export const isClient = typeof window !== 'undefined';

export const headerHeight = 60;
