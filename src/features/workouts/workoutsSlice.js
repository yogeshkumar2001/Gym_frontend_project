import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchWorkoutTemplates,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  removeWorkoutTemplate,
} from '../../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchWorkoutsThunk = createAsyncThunk(
  'workouts/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await fetchWorkoutTemplates(params);
      return result.rows;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch workout templates');
    }
  }
);

export const createWorkoutThunk = createAsyncThunk(
  'workouts/create',
  async (data, { rejectWithValue }) => {
    try {
      const result = await createWorkoutTemplate(data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to create workout template');
    }
  }
);

export const updateWorkoutThunk = createAsyncThunk(
  'workouts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await updateWorkoutTemplate(id, data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update workout template');
    }
  }
);

export const deleteWorkoutThunk = createAsyncThunk(
  'workouts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await removeWorkoutTemplate(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete workout template');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    // Local CRUD — kept for backward compatibility
    addTemplate:    (state, { payload }) => { state.templates.unshift(payload); },
    updateTemplate: (state, { payload }) => {
      const idx = state.templates.findIndex((t) => t.id === payload.id);
      if (idx !== -1) state.templates[idx] = payload;
    },
    deleteTemplate: (state, { payload }) => {
      state.templates = state.templates.filter((t) => t.id !== payload);
    },

    setTemplates: (state, { payload }) => { state.templates = payload; },
    setLoading:   (state, { payload }) => { state.loading   = payload; },
    setError:     (state, { payload }) => { state.error     = payload; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchWorkoutsThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchWorkoutsThunk.fulfilled,  (state, action) => { state.loading = false; state.templates = action.payload; })
      .addCase(fetchWorkoutsThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createWorkoutThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(createWorkoutThunk.fulfilled,  (state, action) => { state.loading = false; state.templates.unshift(action.payload); })
      .addCase(createWorkoutThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updateWorkoutThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(updateWorkoutThunk.fulfilled,  (state, action) => {
        state.loading = false;
        const idx = state.templates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.templates[idx] = action.payload;
      })
      .addCase(updateWorkoutThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // delete
      .addCase(deleteWorkoutThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(deleteWorkoutThunk.fulfilled,  (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteWorkoutThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const {
  addTemplate, updateTemplate, deleteTemplate,
  setTemplates, setLoading, setError,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;
