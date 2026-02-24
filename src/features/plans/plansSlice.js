import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchPlans,
  createPlan as createPlanApi,
  patchPlan,
  removePlan,
} from '../../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchPlansThunk = createAsyncThunk(
  'plans/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await fetchPlans(params);
      return result.rows;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch plans');
    }
  }
);

export const createPlanThunk = createAsyncThunk(
  'plans/create',
  async (data, { rejectWithValue }) => {
    try {
      const result = await createPlanApi(data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to create plan');
    }
  }
);

export const updatePlanThunk = createAsyncThunk(
  'plans/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await patchPlan(id, data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update plan');
    }
  }
);

export const deletePlanThunk = createAsyncThunk(
  'plans/delete',
  async (id, { rejectWithValue }) => {
    try {
      await removePlan(id);
      return id;
    } catch (err) {
      // Backend returns 409 when members are still on this plan
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete plan');
    }
  }
);

// ─── Seed Plans ───────────────────────────────────────────────────────────────
// Used until fetchPlansThunk is dispatched on app load.
const SEED_PLANS = [
  { id: 'monthly',   name: 'Monthly',   description: 'Flexible month-to-month membership with no long-term commitment.', durationMonths: 1,  price: 49.99,  status: 'active' },
  { id: 'quarterly', name: 'Quarterly', description: 'Three-month membership offering better value than monthly.',       durationMonths: 3,  price: 129.99, status: 'active' },
  { id: 'annually',  name: 'Annually',  description: 'Full year membership at the best available rate.',                 durationMonths: 12, price: 449.99, status: 'active' },
];

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  list: SEED_PLANS,
  loading: false,
  error: null,
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    // Local CRUD — kept for backward compatibility
    addPlan:    (state, action) => { state.list.push(action.payload); },
    updatePlan: (state, action) => {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deletePlan: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },

    setPlans:   (state, action) => { state.list    = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError:   (state, action) => { state.error   = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchPlansThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchPlansThunk.fulfilled,  (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPlansThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createPlanThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(createPlanThunk.fulfilled,  (state, action) => { state.loading = false; state.list.push(action.payload); })
      .addCase(createPlanThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updatePlanThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(updatePlanThunk.fulfilled,  (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updatePlanThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // delete
      .addCase(deletePlanThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(deletePlanThunk.fulfilled,  (state, action) => {
        state.loading = false;
        state.list = state.list.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePlanThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { addPlan, updatePlan, deletePlan, setPlans, setLoading, setError } = plansSlice.actions;
export default plansSlice.reducer;
