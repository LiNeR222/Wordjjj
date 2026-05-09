export const refreshToken = async (): Promise<boolean> => {
  const { authStore } = await import('@/entities/auth/model/authStore');
  return await authStore.refreshAccessToken();
};
