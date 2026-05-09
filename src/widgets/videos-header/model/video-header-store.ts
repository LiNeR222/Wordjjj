import { makeAutoObservable, runInAction } from 'mobx';

const initialFilters = {
  category: '',
  auth_required: '',
  is_free: '',
  date_period: '',
  sort_by: '',
};

type FilterType = keyof typeof initialFilters;
const FILTER_KEYS = Object.keys(initialFilters) as FilterType[];

export class VideoHeaderStore {
  initialized = false;
  filters: typeof initialFilters = initialFilters;
  searchValue = '';
  isSearchActive = false;
  isSearchFocused = false;
  isFilterActive = false;
  appliedFiltersCount = 0;
  constructor() {
    makeAutoObservable(this);
  }

  setUpFilters = (searchParams: URLSearchParams) => {
    const filters = Object.fromEntries(
      Array.from(searchParams.entries()).filter(([key]) => FILTER_KEYS.includes(key as FilterType))
    );
    runInAction(() => {
      this.initialized = true;
      //Todo сделать без initialFilters
      this.filters = { ...initialFilters, ...filters };
      this.appliedFiltersCount = Object.values(this.filters).filter(value => value !== '').length;
    });
  };

  updateFilters = (filter: { [key: string]: string }) => {
    runInAction(() => {
      this.filters = { ...this.filters, ...filter };
    });
  };

  toggleIsSearchActive = (value?: boolean) => {
    runInAction(() => {
      this.isSearchActive = value ?? !this.isSearchActive;
    });
  };

  toggleIsFilterActive = (value?: boolean) => {
    runInAction(() => {
      this.isFilterActive = value ?? !this.isFilterActive;
    });
  };

  setIsSearchFocused = (value: boolean) => {
    runInAction(() => {
      this.isSearchFocused = value;
    });
  };

  setSearchValue = (value: string) => {
    runInAction(() => {
      this.searchValue = value || '';
    });
  };

  get hasFilters() {
    return this.appliedFiltersCount > 0;
  }
}

export const videoHeaderStore =
  typeof window !== 'undefined' ? new VideoHeaderStore() : ({} as unknown as VideoHeaderStore);
