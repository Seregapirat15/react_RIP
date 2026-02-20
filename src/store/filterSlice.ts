import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** Redux slice для хранения фильтров услуг (Lab 6).
 *  Позволяет сохранять значения при навигации: Главная → Инструменты — фильтр остаётся.
 */
export interface InstrumentFiltersState {
  search: string;
  type: string;
  minAccuracy: string;
  maxAccuracy: string;
  dateFrom: string;
  dateTo: string;
  filtersExpanded: boolean;
}

const initialState: InstrumentFiltersState = {
  search: '',
  type: '',
  minAccuracy: '',
  maxAccuracy: '',
  dateFrom: '',
  dateTo: '',
  filtersExpanded: false,
};

const filterSlice = createSlice({
  name: 'instrumentFilters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setMinAccuracy: (state, action: PayloadAction<string>) => {
      state.minAccuracy = action.payload;
    },
    setMaxAccuracy: (state, action: PayloadAction<string>) => {
      state.maxAccuracy = action.payload;
    },
    setDateFrom: (state, action: PayloadAction<string>) => {
      state.dateFrom = action.payload;
    },
    setDateTo: (state, action: PayloadAction<string>) => {
      state.dateTo = action.payload;
    },
    setFiltersExpanded: (state, action: PayloadAction<boolean>) => {
      state.filtersExpanded = action.payload;
    },
    resetFilters: () => initialState,
    setFilters: (_, action: PayloadAction<Partial<InstrumentFiltersState>>) => ({
      ...initialState,
      ...action.payload,
    }),
  },
});

export const {
  setSearch,
  setType,
  setMinAccuracy,
  setMaxAccuracy,
  setDateFrom,
  setDateTo,
  setFiltersExpanded,
  resetFilters,
  setFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
