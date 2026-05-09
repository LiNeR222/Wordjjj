/**
 * Сервис для работы с каналами пользователя в контексте кошелька.
 */
import { authStore } from '@/entities/auth/model/authStore';

export class ChannelService {
  /**
   * Получает ID канала текущего пользователя
   * @returns ID канала или null, если не найден
   */
  async getUserChannel(): Promise<number | null> {
    try {
      if (!authStore?.isAuth || !authStore?.user?.id) {
        console.error('Пользователь не авторизован');
        return null;
      }

      const userId = authStore.user.id;
      
      // Здесь можно добавить запрос к API для получения списка каналов пользователя
      // Пока, как в subscription-service, используем ID пользователя как ID канала
      return userId;
    } catch (error) {
      console.error('Ошибка при получении канала пользователя:', error);
      return null;
    }
  }
}

export const channelService = new ChannelService(); 