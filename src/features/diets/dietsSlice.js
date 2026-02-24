import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchDietTemplates,
  createDietTemplate,
  updateDietTemplate,
  removeDietTemplate,
} from '../../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDietsThunk = createAsyncThunk(
  'diets/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await fetchDietTemplates(params);
      return result.rows;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch diet templates');
    }
  }
);

export const createDietThunk = createAsyncThunk(
  'diets/create',
  async (data, { rejectWithValue }) => {
    try {
      const result = await createDietTemplate(data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to create diet template');
    }
  }
);

export const updateDietThunk = createAsyncThunk(
  'diets/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await updateDietTemplate(id, data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update diet template');
    }
  }
);

export const deleteDietThunk = createAsyncThunk(
  'diets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await removeDietTemplate(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete diet template');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  templates: [],
  loading:   false,
  error:     null,
};

const dietsSlice = createSlice({
  name: 'diets',
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
      .addCase(fetchDietsThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchDietsThunk.fulfilled,  (state, action) => { state.loading = false; state.templates = action.payload; })
      .addCase(fetchDietsThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createDietThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(createDietThunk.fulfilled,  (state, action) => { state.loading = false; state.templates.unshift(action.payload); })
      .addCase(createDietThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updateDietThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(updateDietThunk.fulfilled,  (state, action) => {
        state.loading = false;
        const idx = state.templates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.templates[idx] = action.payload;
      })
      .addCase(updateDietThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // delete
      .addCase(deleteDietThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(deleteDietThunk.fulfilled,  (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteDietThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const {
  addTemplate, updateTemplate, deleteTemplate,
  setTemplates, setLoading, setError,
} = dietsSlice.actions;

export default dietsSlice.reducer;
