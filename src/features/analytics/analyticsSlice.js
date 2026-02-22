import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ─── Display labels (shared with components) ──────────────────────────────────
export const METRIC_LABELS = {
  revenue:        'Revenue',
  newMembers:     'New Members',
  activeMembers:  'Active Members',
  pendingAmount:  'Pending Amount',
  attendanceCount:'Attendance Count',
};

export const DIMENSION_LABELS = {
  month:  'Month',
  week:   'Week',
  plan:   'Plan',
  status: 'Status',
};

// ─── Initial state ─────────────────────────────────────────────────────────────
// Default date range: past 6 months → current month end
const initialState = {
  selectedMetric:    'revenue',
  selectedDimension: 'month',
  chartType:         'bar',
  startDate: dayjs().subtract(5, 'month').startOf('month').toISOString(),
  endDate:   dayjs().endOf('month').toISOString(),
  isGenerated: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setMetric: (state, action) => {
      state.selectedMetric = action.payload;
      state.isGenerated = false;
    },

    setDimension: (state, action) => {
      state.selectedDimension = action.payload;
      // Auto-correct: donut + time dimension is incompatible
      if (['month', 'week'].includes(action.payload) && state.chartType === 'donut') {
        state.chartType = 'bar';
      }
      state.isGenerated = false;
    },

    setChartType: (state, action) => {
      state.chartType = action.payload;
      // Auto-correct: switching to donut resets time dimension → plan
      if (action.payload === 'donut' && ['month', 'week'].includes(state.selectedDimension)) {
        state.selectedDimension = 'plan';
      }
      state.isGenerated = false;
    },

    setAnalyticsDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate   = action.payload.endDate;
      state.isGenerated = false;
    },

    // Triggers chart computation via selector
    applyAnalytics: (state) => {
      state.isGenerated = true;
    },

    resetAnalytics: () => initialState,
  },
});

export const {
  setMetric,
  setDimension,
  setChartType,
  setAnalyticsDateRange,
  applyAnalytics,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
