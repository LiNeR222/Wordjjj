import { FC } from 'react';

export interface NumberPairProps {
  children: [number | string, number | string];
}

export const NumberPair: FC<NumberPairProps> = ({ children: [first, second] }) => {
  return (
    <span className='flex flex-wrap items-center gap-0.5'>
      <span>{first}</span>/<span>{second}</span>
    </span>
  );
};
