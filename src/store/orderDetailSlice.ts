import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ExoplanetCalculationsApi } from '../services/generated/ExoplanetCalculationsApi';
import { Order } from '../types';

export interface OrderDetailState {
  order: Order | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OrderDetailState = {
  order: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

export const fetchExoplanetCalculationById = createAsyncThunk(
  'orderDetail/fetchExoplanetCalculationById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.getExoplanetCalculationById(id);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка загрузки заявки';
      return rejectWithValue(msg);
    }
  },
);

export const updateExoplanetCalculation = createAsyncThunk(
  'orderDetail/updateExoplanetCalculation',
  async ({ orderId, fields }: { orderId: number; fields: Partial<Order> }, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.updateExoplanetCalculation(orderId, fields);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка обновления заявки';
      return rejectWithValue(msg);
    }
  },
);

export const formExoplanetCalculation = createAsyncThunk(
  'orderDetail/formExoplanetCalculation',
  async (orderId: number, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.formExoplanetCalculation(orderId);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка формирования заявки';
      return rejectWithValue(msg);
    }
  },
);

export const deleteExoplanetCalculation = createAsyncThunk(
  'orderDetail/deleteExoplanetCalculation',
  async (orderId: number, { rejectWithValue }) => {
    try {
      await ExoplanetCalculationsApi.deleteExoplanetCalculation(orderId);
      return orderId;
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка удаления заявки';
      return rejectWithValue(msg);
    }
  },
);

export const removeInstrumentFromCalculation = createAsyncThunk(
  'orderDetail/removeInstrumentFromCalculation',
  async ({ orderId, serviceId }: { orderId: number; serviceId: number }, { rejectWithValue }) => {
    try {
      await ExoplanetCalculationsApi.removeInstrumentFromCalculation(orderId, serviceId);
      return { orderId, serviceId };
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка удаления инструмента';
      return rejectWithValue(msg);
    }
  },
);

export const updateCalculationInstrumentParams = createAsyncThunk(
  'orderDetail/updateCalculationInstrumentParams',
  async (
    { orderId, serviceId, params }: {
      orderId: number;
      serviceId: number;
      params: {
        exoplanet_name: string; star_mass: number; orbital_period: number;
        velocity_amplitude: number; inclination: number; eccentricity: number;
        comment?: string; other_info?: string;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      await ExoplanetCalculationsApi.updateCalculationInstrumentParams(orderId, serviceId, params);
      return { orderId, serviceId, params };
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка обновления параметров';
      return rejectWithValue(msg);
    }
  },
);

const orderDetailSlice = createSlice({
  name: 'orderDetail',
  initialState,
  reducers: {
    clearOrderDetail: () => initialState,
    clearOrderDetailMessages: (state) => { state.error = null; state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExoplanetCalculationById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchExoplanetCalculationById.fulfilled, (state, action) => { state.loading = false; state.order = action.payload; })
      .addCase(fetchExoplanetCalculationById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(updateExoplanetCalculation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateExoplanetCalculation.fulfilled, (state, action) => {
        state.actionLoading = false; state.order = action.payload; state.successMessage = 'Заявка обновлена';
      })
      .addCase(updateExoplanetCalculation.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })

      .addCase(formExoplanetCalculation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(formExoplanetCalculation.fulfilled, (state, action) => {
        state.actionLoading = false; state.order = action.payload; state.successMessage = 'Заявка сформирована';
      })
      .addCase(formExoplanetCalculation.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })

      .addCase(deleteExoplanetCalculation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(deleteExoplanetCalculation.fulfilled, (state) => {
        state.actionLoading = false; state.order = null; state.successMessage = 'Заявка удалена';
      })
      .addCase(deleteExoplanetCalculation.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })

      .addCase(removeInstrumentFromCalculation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeInstrumentFromCalculation.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.order?.services) {
          state.order.services = state.order.services.filter(s => s.service_id !== action.payload.serviceId);
        }
        state.successMessage = 'Инструмент удалён из заявки';
      })
      .addCase(removeInstrumentFromCalculation.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })

      .addCase(updateCalculationInstrumentParams.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateCalculationInstrumentParams.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.order?.services) {
          const idx = state.order.services.findIndex(s => s.service_id === action.payload.serviceId);
          if (idx >= 0) Object.assign(state.order.services[idx], action.payload.params);
        }
        state.successMessage = 'Параметры обновлены';
      })
      .addCase(updateCalculationInstrumentParams.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; });
  },
});

export const { clearOrderDetail, clearOrderDetailMessages } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
