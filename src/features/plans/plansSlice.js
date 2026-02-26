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

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  list: [],
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
