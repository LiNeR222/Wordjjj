import { Category } from '../types';

export const categories: Category[] = [
  { key: 'all', label: 'Все', href: '/' },
  { key: 'video', label: 'Видео', href: '/videos' },
  // { key: 'audio', label: 'Аудио', href: '/audio' },
  { key: 'shorts', label: 'Шортс', href: '/shorts' },
] as const;

export const theme = {
  token: {
    colorPrimary: '#000',
  },
  components: {
    Radio: {
      colorPrimary: '#000',
      colorBorder: '#1F2937',
    },
    Input: {
      activeShadow: 'none',
    },
    Button: {
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
    Select: {
      optionSelectedColor: '#FFF',
      optionSelectedBg: '#000',
    },
  },
};
