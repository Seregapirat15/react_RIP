import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ExoplanetCalculationsApi, ExoplanetOrdersFilter } from '../services/generated/ExoplanetCalculationsApi';
import { Order } from '../types';

export interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  filterStatus: string;
  filterDateFrom: string;
  filterDateTo: string;
}

const today = new Date().toISOString().slice(0, 10);

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  filterStatus: '',
  filterDateFrom: today,
  filterDateTo: today,
};

export const fetchExoplanetCalculations = createAsyncThunk(
  'orders/fetchExoplanetCalculations',
  async (filters: ExoplanetOrdersFilter = {}, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.getExoplanetCalculations(filters);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка загрузки заявок';
      return rejectWithValue(msg);
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrdersFilterStatus: (state, action) => { state.filterStatus = action.payload; },
    setOrdersFilterDateFrom: (state, action) => { state.filterDateFrom = action.payload; },
    setOrdersFilterDateTo: (state, action) => { state.filterDateTo = action.payload; },
    resetOrdersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExoplanetCalculations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchExoplanetCalculations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExoplanetCalculations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setOrdersFilterStatus, setOrdersFilterDateFrom, setOrdersFilterDateTo, resetOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;
