import { createSlice } from '@reduxjs/toolkit';

// ─── State shape ──────────────────────────────────────────────────────────────
//
// Template structure:
// {
//   id          : string
//   name        : string
//   description : string
//   difficulty  : 'beginner' | 'intermediate' | 'advanced'
//   status      : 'active' | 'draft'
//   createdAt   : ISO string
//   days: [
//     {
//       id       : string
//       dayName  : string
//       exercises: [
//         { id, exerciseName, sets, reps, restSeconds, notes }
//       ]
//     }
//   ]
// }

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    // ── CRUD ──────────────────────────────────────────────────────────────────
    addTemplate: (state, { payload }) => {
      state.templates.unshift(payload); // newest first
    },
    updateTemplate: (state, { payload }) => {
      const idx = state.templates.findIndex((t) => t.id === payload.id);
      if (idx !== -1) state.templates[idx] = payload;
    },
    deleteTemplate: (state, { payload }) => {
      state.templates = state.templates.filter((t) => t.id !== payload);
    },

    // ── Bulk / async ──────────────────────────────────────────────────────────
    setTemplates: (state, { payload }) => { state.templates = payload; },
    setLoading:   (state, { payload }) => { state.loading   = payload; },
    setError:     (state, { payload }) => { state.error     = payload; },
  },
});

export const {
  addTemplate, updateTemplate, deleteTemplate,
  setTemplates, setLoading, setError,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;
