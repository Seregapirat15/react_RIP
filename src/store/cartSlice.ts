import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ExoplanetCalculationsApi } from '../services/generated/ExoplanetCalculationsApi';
import { CartIcon, AddToOrderData } from '../types';

export interface CartState {
  cart: CartIcon | null;
  loading: boolean;
  addLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  addLoading: false,
  error: null,
  successMessage: null,
};

export const fetchExoplanetCart = createAsyncThunk(
  'cart/fetchExoplanetCart',
  async (_, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.getExoplanetCalculationCartIcon();
    } catch {
      return rejectWithValue('');
    }
  },
);

export const addInstrumentToCalculation = createAsyncThunk(
  'cart/addInstrumentToCalculation',
  async (data: AddToOrderData, { rejectWithValue }) => {
    try {
      return await ExoplanetCalculationsApi.addInstrumentToCalculation(data);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) return rejectWithValue('Этот инструмент уже в заявке');
      if (status === 401) return rejectWithValue('Требуется авторизация');
      return rejectWithValue('Ошибка при добавлении');
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: () => initialState,
    clearCartMessages: (state) => { state.error = null; state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExoplanetCart.pending, (state) => { state.loading = true; })
      .addCase(fetchExoplanetCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload; })
      .addCase(fetchExoplanetCart.rejected, (state) => { state.loading = false; state.cart = null; })

      .addCase(addInstrumentToCalculation.pending, (state) => { state.addLoading = true; state.error = null; state.successMessage = null; })
      .addCase(addInstrumentToCalculation.fulfilled, (state) => {
        state.addLoading = false;
        state.successMessage = 'Инструмент добавлен в заявку';
      })
      .addCase(addInstrumentToCalculation.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCartState, clearCartMessages } = cartSlice.actions;
export default cartSlice.reducer;
