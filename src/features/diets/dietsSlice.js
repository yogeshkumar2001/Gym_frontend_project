import { createSlice } from '@reduxjs/toolkit';

// ─── State shape ──────────────────────────────────────────────────────────────
//
// Template structure:
// {
//   id          : string
//   name        : string
//   description : string
//   goalType    : 'cutting' | 'bulking' | 'maintenance' | 'custom'
//   status      : 'active' | 'draft'
//   createdAt   : ISO string
//   days: [
//     {
//       id      : string
//       dayName : string
//       meals: [
//         {
//           id       : string
//           mealName : string
//           foods: [
//             {
//               id        : string
//               foodName  : string
//               quantity  : string   (e.g. "100g", "1 bowl")
//               calories  : number | null
//               protein   : number | null
//               carbs     : number | null
//               fats      : number | null
//               notes     : string
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }

const initialState = {
  templates: [],
  loading:   false,
  error:     null,
};

const dietsSlice = createSlice({
  name: 'diets',
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
} = dietsSlice.actions;

export default dietsSlice.reducer;
