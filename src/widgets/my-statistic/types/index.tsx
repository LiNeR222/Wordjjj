export enum Period {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export const periodLabels: Record<Period, string> = {
  [Period.ALL]: 'за все время',
  [Period.WEEK]: 'за неделю',
  [Period.MONTH]: 'за месяц',
  [Period.YEAR]: 'за год',
};
