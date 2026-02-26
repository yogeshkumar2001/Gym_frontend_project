import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, getMe } from '../../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * loginUser — authenticates with the backend.
 * Stores accessToken in localStorage, returns { user, token }.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await loginApi(credentials);
      localStorage.setItem('gym_token', result.accessToken);
      return { user: result.user, token: result.accessToken };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Invalid email or password'
      );
    }
  }
);

/**
 * restoreSessionThunk — called once on app cold-load.
 *
 * Checks localStorage for a stored token, then validates it by calling
 * GET /auth/me. On success the user is restored into Redux without requiring
 * a new login. On failure the stale token is removed.
 */
export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('gym_token');
    if (!token) return rejectWithValue('no token');
    try {
      const result = await getMe();
      return { user: result.data, token };
    } catch {
      localStorage.removeItem('gym_token');
      return rejectWithValue('session expired');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

const initialState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  isRestoring:     true,   // blocks ProtectedRoute until restore attempt settles
  loading:         false,
  error:           null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => {
      localStorage.removeItem('gym_token');
      return { ...initialState, isRestoring: false };
    },
  },
  extraReducers: (builder) => {
    builder
      // ── loginUser ───────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.isAuthenticated = true;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.error           = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── restoreSession ──────────────────────────────────────────────────────
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.isRestoring     = false;
        state.isAuthenticated = true;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        state.isRestoring     = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
