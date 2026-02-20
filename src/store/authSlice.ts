import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    setAuthError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
    clearAuthError: (state) => { state.error = null; },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
    resetAuthState: () => ({ ...initialState, isAuthenticated: false }),
  },
});

export const {
  setAuthLoading,
  setAuthError,
  clearAuthError,
  loginSuccess,
  logoutSuccess,
  setUser,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
