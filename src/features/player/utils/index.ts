export const convertRatio = (ratio: string) => {
  if (!ratio.includes(':')) {
    throw new Error('Invalid ratio format. Expected format like "16:9"');
  }

  return ratio.replace(':', '/');
};
