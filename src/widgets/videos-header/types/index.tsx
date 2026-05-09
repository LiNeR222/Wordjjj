import { categories } from '../config';

export interface Category {
  key: string;
  label: string;
  href: string;
}

export type CategoryKey = (typeof categories)[number]['key'];
