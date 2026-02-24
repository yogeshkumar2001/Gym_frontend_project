import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchPayments,
  createPayment as createPaymentApi,
  updatePayment as updatePaymentApi,
  deletePayment as deletePaymentApi,
} from '../../services/api';
import { seedPayments } from '../../data/seedData';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchPaymentsThunk = createAsyncThunk(
  'payments/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await fetchPayments(filters);
      return result.rows;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch payments');
    }
  }
);

export const createPaymentThunk = createAsyncThunk(
  'payments/create',
  async (data, { rejectWithValue }) => {
    try {
      const result = await createPaymentApi(data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to create payment');
    }
  }
);

export const updatePaymentThunk = createAsyncThunk(
  'payments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await updatePaymentApi(id, data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update payment');
    }
  }
);

export const deletePaymentThunk = createAsyncThunk(
  'payments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deletePaymentApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete payment');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  list: [...seedPayments],
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Local CRUD — kept for backward compatibility
    addPayment: (state, action) => {
      state.list.unshift(action.payload);
    },
    updatePayment: (state, action) => {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deletePayment: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },

    setPayments: (state, action) => { state.list    = action.payload; },
    setLoading:  (state, action) => { state.loading = action.payload; },
    setError:    (state, action) => { state.error   = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchPaymentsThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchPaymentsThunk.fulfilled,  (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPaymentsThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createPaymentThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(createPaymentThunk.fulfilled,  (state, action) => { state.loading = false; state.list.unshift(action.payload); })
      .addCase(createPaymentThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updatePaymentThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(updatePaymentThunk.fulfilled,  (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updatePaymentThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // delete
      .addCase(deletePaymentThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(deletePaymentThunk.fulfilled,  (state, action) => {
        state.loading = false;
        state.list = state.list.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePaymentThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { addPayment, updatePayment, deletePayment, setPayments, setLoading, setError } =
  paymentsSlice.actions;

export default paymentsSlice.reducer;
