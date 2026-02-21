import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metrics: {
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    expiredPlans: 0,
  },
  chartData: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setChartData: (state, action) => {
      state.chartData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setMetrics, setChartData, setLoading, setError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
