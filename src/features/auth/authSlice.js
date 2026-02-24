import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi } from '../../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await loginApi(credentials);
      localStorage.setItem('gym_token', result.data.token);
      return result.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const result = await registerApi(data);
      localStorage.setItem('gym_token', result.data.token);
      return result.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Registration failed');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Kept for backward compatibility — prefer loginThunk for new code
    loginStart:   (state)         => { state.loading = true; state.error = null; },
    loginSuccess: (state, action) => { state.loading = false; state.isAuthenticated = true; state.user = action.payload; },
    loginFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    logout: () => {
      localStorage.removeItem('gym_token');
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(loginThunk.fulfilled,  (state, action) => { state.loading = false; state.isAuthenticated = true; state.user = action.payload; })
      .addCase(loginThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(registerThunk.pending,   (state)         => { state.loading = true;  state.error = null; })
      .addCase(registerThunk.fulfilled, (state, action) => { state.loading = false; state.isAuthenticated = true; state.user = action.payload; })
      .addCase(registerThunk.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
