export const getSkeletonsConfig = ({ vertical }: { vertical: boolean }) => {
  return {
    shorts: {
      count: vertical ? 12 : 8,
      containerClass: vertical
        ? 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2'
        : 'flex justify-start items-start w-full overflow-x-hidden gap-6',
      itemClass: `flex flex-col justify-center rounded-2xl p-2 w-[275px] ${vertical ? 'mx-auto' : ''}`,
      textConfig: [
        { rows: 1, height: 16 },
        { rows: 1, height: 14 },
        { rows: 1, height: 14 },
      ],
    },
    videos: {
      count: 12,
      containerClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-1 gap-y-3 row-auto',
      itemClass: 'flex justify-center w-full h-full min-h-[250px]',
      textConfig: [
        { rows: 1, height: 20 },
        { rows: 1, height: 16 },
        { rows: 1, height: 16 },
      ],
    },
  };
};
