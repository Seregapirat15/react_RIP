/**
 * Lab8: Слайс для интерфейса модератора — short polling, фильтры, смена статуса.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAdminOrders, completeOrder, triggerAsyncCalculation } from '../services/api';
import { Order } from '../types';

export interface AdminOrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  filterStatus: string;
  filterDateFrom: string;
  filterDateTo: string;
  filterCreatorId: string; // ID создателя как строка
  actionLoading: number | null; // ID заявки, над которой идёт действие
}

const initialState: AdminOrdersState = {
  items: [],
  loading: false,
  error: null,
  filterStatus: '',
  filterDateFrom: '',
  filterDateTo: '',
  filterCreatorId: '',
  actionLoading: null,
};

export const fetchAdminOrdersThunk = createAsyncThunk(
  'adminOrders/fetch',
  async (_, { getState }) => {
    const state = getState() as { adminOrders: AdminOrdersState };
    const { filterStatus, filterDateFrom, filterDateTo, filterCreatorId } = state.adminOrders;
    return fetchAdminOrders({
      status: filterStatus || undefined,
      formation_from: filterDateFrom || undefined,
      formation_to: filterDateTo || undefined,
      creator_id: filterCreatorId ? parseInt(filterCreatorId) : undefined,
    });
  },
);

export const completeOrderThunk = createAsyncThunk(
  'adminOrders/complete',
  async (
    { orderId, action, result }: { orderId: number; action: 'complete' | 'reject'; result?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await completeOrder(orderId, action, result);
      dispatch(fetchAdminOrdersThunk());
      return orderId;
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Ошибка завершения заявки';
      return rejectWithValue(msg);
    }
  },
);

export const triggerAsyncCalcThunk = createAsyncThunk(
  'adminOrders/triggerAsync',
  async (orderId: number, { dispatch, rejectWithValue }) => {
    try {
      await triggerAsyncCalculation(orderId);
      return orderId;
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Не удалось запустить расчёт';
      return rejectWithValue(msg);
    }
  },
);

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    setAdminFilterStatus: (state, action) => { state.filterStatus = action.payload; },
    setAdminFilterDateFrom: (state, action) => { state.filterDateFrom = action.payload; },
    setAdminFilterDateTo: (state, action) => { state.filterDateTo = action.payload; },
    setAdminFilterCreatorId: (state, action) => { state.filterCreatorId = action.payload; },
    resetAdminFilters: (state) => {
      state.filterStatus = '';
      state.filterDateFrom = '';
      state.filterDateTo = '';
      state.filterCreatorId = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrdersThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(completeOrderThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg.orderId;
      })
      .addCase(completeOrderThunk.fulfilled, (state) => { state.actionLoading = null; })
      .addCase(completeOrderThunk.rejected, (state) => { state.actionLoading = null; })
      .addCase(triggerAsyncCalcThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(triggerAsyncCalcThunk.fulfilled, (state) => { state.actionLoading = null; })
      .addCase(triggerAsyncCalcThunk.rejected, (state) => { state.actionLoading = null; });
  },
});

export const {
  setAdminFilterStatus,
  setAdminFilterDateFrom,
  setAdminFilterDateTo,
  setAdminFilterCreatorId,
  resetAdminFilters,
} = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
