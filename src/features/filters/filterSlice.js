import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  startDate: null,   // ISO string or null
  endDate: null,     // ISO string or null
  status: 'all',     // 'all' | 'active' | 'expired' | 'inactive'
  plan: 'all',       // 'all' | 'monthly' | 'quarterly' | 'annually'
  search: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setPlan: (state, action) => {
      state.plan = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setDateRange, setStatus, setPlan, setSearch, resetFilters } =
  filterSlice.actions;

export default filterSlice.reducer;
