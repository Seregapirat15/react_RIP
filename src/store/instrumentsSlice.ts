import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Instrument } from '../types';

export interface InstrumentsState {
  items: Instrument[];
  current: Instrument | null;
  loading: boolean;
  error: string | null;
}

const initialState: InstrumentsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

const instrumentsSlice = createSlice({
  name: 'instruments',
  initialState,
  reducers: {
    setInstrumentsLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    setInstruments: (state, action: PayloadAction<Instrument[]>) => { state.items = action.payload; state.error = null; },
    setInstrumentsError: (state, action: PayloadAction<string>) => { state.error = action.payload; },
    setCurrentInstrument: (state, action: PayloadAction<Instrument | null>) => { state.current = action.payload; },
    resetInstrumentsState: () => initialState,
  },
});

export const {
  setInstrumentsLoading,
  setInstruments,
  setInstrumentsError,
  setCurrentInstrument,
  resetInstrumentsState,
} = instrumentsSlice.actions;

export default instrumentsSlice.reducer;
