import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchMembers,
  createMember as createMemberApi,
  updateMember as updateMemberApi,
  deleteMember as deleteMemberApi,
} from '../../services/api';
import { seedMembers } from '../../data/seedData';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchMembersThunk = createAsyncThunk(
  'members/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await fetchMembers(filters);
      return result.rows;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch members');
    }
  }
);

export const createMemberThunk = createAsyncThunk(
  'members/create',
  async (data, { rejectWithValue }) => {
    try {
      const result = await createMemberApi(data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to create member');
    }
  }
);

export const updateMemberThunk = createAsyncThunk(
  'members/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await updateMemberApi(id, data);
      return result.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update member');
    }
  }
);

export const deleteMemberThunk = createAsyncThunk(
  'members/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteMemberApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete member');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  list: [...seedMembers],
  loading: false,
  error: null,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    // ── Local CRUD (used by CSV import and assignment flows) ──────────────────
    addMember: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateMember: (state, action) => {
      const idx = state.list.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteMember: (state, action) => {
      state.list = state.list.filter((m) => m.id !== action.payload);
    },

    // ── Assignment actions (local — Redux only) ───────────────────────────────
    assignWorkoutToMember: (state, { payload }) => {
      const { memberId, templateId, templateName, assignedDate, newId, completedAt } = payload;
      const member = state.list.find((m) => String(m.id) === String(memberId));
      if (!member) return;
      if (!member.workoutAssignments) member.workoutAssignments = [];
      const prev = member.workoutAssignments.find((a) => a.status === 'active');
      if (prev) { prev.status = 'completed'; prev.completedDate = completedAt; }
      member.workoutAssignments.push({
        id: newId, templateId, templateName, assignedDate, completedDate: null, status: 'active',
      });
    },

    assignDietToMember: (state, { payload }) => {
      const { memberId, templateId, templateName, assignedDate, newId, completedAt } = payload;
      const member = state.list.find((m) => String(m.id) === String(memberId));
      if (!member) return;
      if (!member.dietAssignments) member.dietAssignments = [];
      const prev = member.dietAssignments.find((a) => a.status === 'active');
      if (prev) { prev.status = 'completed'; prev.completedDate = completedAt; }
      member.dietAssignments.push({
        id: newId, templateId, templateName, assignedDate, completedDate: null, status: 'active',
      });
    },

    // ── Bulk setters ──────────────────────────────────────────────────────────
    setMembers: (state, action) => { state.list    = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError:   (state, action) => { state.error   = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchMembersThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchMembersThunk.fulfilled,  (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMembersThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // create
      .addCase(createMemberThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(createMemberThunk.fulfilled,  (state, action) => { state.loading = false; state.list.unshift(action.payload); })
      .addCase(createMemberThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updateMemberThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(updateMemberThunk.fulfilled,  (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateMemberThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // delete
      .addCase(deleteMemberThunk.pending,    (state)         => { state.loading = true;  state.error = null; })
      .addCase(deleteMemberThunk.fulfilled,  (state, action) => {
        state.loading = false;
        state.list = state.list.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMemberThunk.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const {
  addMember, updateMember, deleteMember,
  assignWorkoutToMember, assignDietToMember,
  setMembers, setLoading, setError,
} = membersSlice.actions;

export default membersSlice.reducer;
