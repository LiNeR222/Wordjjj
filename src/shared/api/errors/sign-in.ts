export const signIn = async (options?: { videoId?: string }) => {
  const { authStore } = await import('@/entities/auth/model/authStore');
  return await authStore.signIn(true, options?.videoId);
};
