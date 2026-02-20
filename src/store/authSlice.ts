import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExoplanetAuthApi } from '../services/generated';
import { User, LoginData, RegisterData } from '../types';

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

export const loginExoplanetUser = createAsyncThunk(
  'auth/loginExoplanetUser',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await ExoplanetAuthApi.loginExoplanetUser(credentials);
      return response;
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка входа';
      return rejectWithValue(msg);
    }
  },
);

export const registerExoplanetUser = createAsyncThunk(
  'auth/registerExoplanetUser',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await ExoplanetAuthApi.registerExoplanetUser(data);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка регистрации';
      return rejectWithValue(msg);
    }
  },
);

export const logoutExoplanetUser = createAsyncThunk(
  'auth/logoutExoplanetUser',
  async () => {
    await ExoplanetAuthApi.logoutExoplanetUser();
  },
);

export const fetchExoplanetCurrentUser = createAsyncThunk(
  'auth/fetchExoplanetCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await ExoplanetAuthApi.getExoplanetCurrentUser();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка получения пользователя';
      return rejectWithValue(msg);
    }
  },
);

export const updateExoplanetProfile = createAsyncThunk(
  'auth/updateExoplanetProfile',
  async (fields: Partial<User & { password?: string }>, { rejectWithValue }) => {
    try {
      return await ExoplanetAuthApi.updateExoplanetUser(fields);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Ошибка обновления профиля';
      return rejectWithValue(msg);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => { state.error = null; },
    resetAuthState: () => initialState,
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginExoplanetUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginExoplanetUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginExoplanetUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerExoplanetUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerExoplanetUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerExoplanetUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutExoplanetUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(fetchExoplanetCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(fetchExoplanetCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchExoplanetCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateExoplanetProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateExoplanetProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateExoplanetProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuthError, resetAuthState, setUser } = authSlice.actions;
export default authSlice.reducer;
