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

    // ── Assignment actions ────────────────────────────────────────────────
    // Enforce single active rule: mark existing active as completed, push new.
    // IDs and timestamps are generated at dispatch time (payload) to keep
    // reducers pure and testable.
    //
    // Payload: { memberId, templateId, templateName, assignedDate, newId, completedAt }
    //
    // Backend integration: replace with
    //   POST /members/:id/workout-assignment  → { assignment }
    //   POST /members/:id/diet-assignment     → { assignment }
    assignWorkoutToMember: (state, { payload }) => {
      const { memberId, templateId, templateName, assignedDate, newId, completedAt } = payload;
      const member = state.list.find((m) => String(m.id) === String(memberId));
      if (!member) return;

      if (!member.workoutAssignments) member.workoutAssignments = [];

      // Complete any existing active assignment
      const prev = member.workoutAssignments.find((a) => a.status === 'active');
      if (prev) {
        prev.status        = 'completed';
        prev.completedDate = completedAt;
      }

      member.workoutAssignments.push({
        id:            newId,
        templateId,
        templateName,
        assignedDate,
        completedDate: null,
        status:        'active',
      });
    },

    assignDietToMember: (state, { payload }) => {
      const { memberId, templateId, templateName, assignedDate, newId, completedAt } = payload;
      const member = state.list.find((m) => String(m.id) === String(memberId));
      if (!member) return;

      if (!member.dietAssignments) member.dietAssignments = [];

      const prev = member.dietAssignments.find((a) => a.status === 'active');
      if (prev) {
        prev.status        = 'completed';
        prev.completedDate = completedAt;
      }

      member.dietAssignments.push({
        id:            newId,
        templateId,
        templateName,
        assignedDate,
        completedDate: null,
        status:        'active',
      });
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
  assignWorkoutToMember,
  assignDietToMember,
  setMembers,
  setLoading,
  setError,
} = membersSlice.actions;

export default membersSlice.reducer;
