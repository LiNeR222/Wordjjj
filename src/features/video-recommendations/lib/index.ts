export const sliceVideos = <T>(array: T[], offset?: number): T[] => {
  return offset ? array.slice(offset) : array;
};
