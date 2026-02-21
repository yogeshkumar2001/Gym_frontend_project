import { createSlice } from '@reduxjs/toolkit';
import { seedPayments } from '../../data/seedData';

const initialState = {
  list: [...seedPayments],   // 100 seed payments (2 per member)
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // ── CRUD ────────────────────────────────────────────────────────────────
    addPayment: (state, action) => {
      state.list.unshift(action.payload);           // newest first
    },
    deletePayment: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },

    // ── Future API integration ────────────────────────────────────────────
    // After GET /payments?... → dispatch(setPayments(response.data))
    setPayments: (state, action) => {
      state.list = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { addPayment, deletePayment, setPayments, setLoading, setError } =
  paymentsSlice.actions;

export default paymentsSlice.reducer;
