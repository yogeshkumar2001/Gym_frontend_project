import { createSlice } from '@reduxjs/toolkit';
import { seedMembers } from '../../data/seedData';

const initialState = {
  list: [...seedMembers],
  loading: false,
  error: null,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    // ── CRUD ────────────────────────────────────────────────────────────────
    addMember: (state, action) => {
      state.list.unshift(action.payload);           // newest first
    },
    updateMember: (state, action) => {
      const idx = state.list.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteMember: (state, action) => {
      state.list = state.list.filter((m) => m.id !== action.payload);
    },

    // ── Future API integration ────────────────────────────────────────────
    // Replace addMember/updateMember/deleteMember with these when backend is ready:
    // dispatch(setMembers(response.data));  after GET /members
    setMembers: (state, action) => {
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
  addMember,
  updateMember,
  deleteMember,
  setMembers,
  setLoading,
  setError,
} = membersSlice.actions;

export default membersSlice.reducer;
