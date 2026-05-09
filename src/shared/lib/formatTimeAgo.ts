const isSameDay = (date1: Date, date2: Date): boolean => date1.toDateString() === date2.toDateString();

const isYesterday = (date1: Date, date2: Date): boolean => {
  const startOfYesterday = new Date(date2);
  startOfYesterday.setDate(date2.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(startOfYesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  return date1 >= startOfYesterday && date1 <= endOfYesterday;
};

export const formatTimeAgo = (isoDate: string): string => {
  const past = new Date(isoDate);
  const now = new Date();

  const pastLocal = new Date(past.getTime() - past.getTimezoneOffset() * 60000);
  const diffInMilliseconds = Math.abs(now.getTime() - pastLocal.getTime());

  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  } else if (isSameDay(pastLocal, now)) {
    return 'сегодня ' + pastLocal.toLocaleTimeString('ru-RU', { timeStyle: 'medium' });
  } else if (isYesterday(pastLocal, now)) {
    return 'вчера ' + pastLocal.toLocaleTimeString('ru-RU', { timeStyle: 'short' });
  } else if (diffInDays < 30) {
    return `${diffInDays} дн.`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} мес.`;
  } else {
    const months = diffInMonths % 12;
    return `${diffInYears} лет ${months} мес.`;
  }
};
