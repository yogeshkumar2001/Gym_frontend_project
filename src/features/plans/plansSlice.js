import { createSlice } from '@reduxjs/toolkit';

// ─── Seed Plans ───────────────────────────────────────────────────────────────
// Seeded from PLAN_CONFIG — matches the planId values used in membersSlice seed data.
const SEED_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Flexible month-to-month membership with no long-term commitment.',
    durationMonths: 1,
    price: 49.99,
    status: 'active',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    description: 'Three-month membership offering better value than monthly.',
    durationMonths: 3,
    price: 129.99,
    status: 'active',
  },
  {
    id: 'annually',
    name: 'Annually',
    description: 'Full year membership at the best available rate.',
    durationMonths: 12,
    price: 449.99,
    status: 'active',
  },
];

const initialState = {
  list: SEED_PLANS,
  loading: false,
  error: null,
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    // ── CRUD actions ──────────────────────────────────────────────────────────
    addPlan: (state, action) => {
      state.list.push(action.payload);
    },
    updatePlan: (state, action) => {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deletePlan: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },

    // ── Bulk / async ──────────────────────────────────────────────────────────
    setPlans: (state, action) => {
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

export const {
  addPlan,
  updatePlan,
  deletePlan,
  setPlans,
  setLoading,
  setError,
} = plansSlice.actions;

export default plansSlice.reducer;
