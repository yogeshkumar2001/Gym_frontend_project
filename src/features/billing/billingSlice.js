import { createSlice } from '@reduxjs/toolkit';
import { seedInvoices } from '../../data/seedData';

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    list: seedInvoices,
    loading: false,
    error: null,
  },
  reducers: {
    addInvoice(state, action) {
      state.list.unshift(action.payload);
    },
    deleteInvoice(state, action) {
      state.list = state.list.filter((inv) => inv.id !== action.payload);
    },
    // Link an existing invoice to a payment after payment is recorded
    linkPayment(state, action) {
      const { invoiceId, paymentId } = action.payload;
      const inv = state.list.find((inv) => inv.id === invoiceId);
      if (inv) inv.paymentId = paymentId;
    },
    setInvoices(state, action) {
      state.list = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  addInvoice,
  deleteInvoice,
  linkPayment,
  setInvoices,
  setLoading,
  setError,
} = billingSlice.actions;

export default billingSlice.reducer;
