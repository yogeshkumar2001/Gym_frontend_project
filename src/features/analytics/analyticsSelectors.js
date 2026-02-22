import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ─── Raw input selectors ───────────────────────────────────────────────────────
const selectMembersList   = (state) => state.members.list;
const selectPaymentsList  = (state) => state.payments.list;
const selectFiltersState  = (state) => state.filters;
const selectAnalyticsState = (state) => state.analytics;

// Re-exported for component use
export const selectAnalyticsConfig = selectAnalyticsState;

// ─── Date helpers ──────────────────────────────────────────────────────────────
const inRange = (dateStr, startTs, endTs) => {
  if (!startTs || !endTs) return true;
  const ts = dayjs(dateStr).valueOf();
  return ts >= startTs && ts <= endTs;
};

const monthKey   = (d) => dayjs(d).format('YYYY-MM');
const monthLabel = (d) => dayjs(d).format("MMM 'YY");

const weekKey = (d) => dayjs(d).startOf('week').format('YYYY-MM-DD');
const weekLabel = (d) => {
  const s = dayjs(d).startOf('week');
  const e = s.add(6, 'day');
  return s.month() === e.month()
    ? `${s.format('MMM D')}–${e.format('D')}`
    : `${s.format('MMM D')}–${e.format('MMM D')}`;
};

// ─── Dimension key/label extractor ────────────────────────────────────────────
// source: 'payment' | 'member'
// memberMap: used to resolve member status for payment rows
const getDimensionInfo = (dimension, source, row, memberMap) => {
  const dateStr = source === 'payment' ? row.paymentDate : row.joiningDate;

  switch (dimension) {
    case 'month':
      return { key: monthKey(dateStr), label: monthLabel(dateStr) };

    case 'week':
      return { key: weekKey(dateStr), label: weekLabel(dateStr) };

    case 'plan':
      return {
        key:   row.planId   ?? 'unknown',
        label: row.planName ?? row.planId ?? 'Unknown',
      };

    case 'status': {
      const status =
        source === 'payment'
          ? (memberMap[row.memberId]?.status ?? 'unknown')
          : row.status;
      return {
        key:   status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    default:
      return null;
  }
};

// ─── Aggregator — monetary sum ─────────────────────────────────────────────────
// Groups items into buckets and sums a numeric field per bucket.
const aggregateSum = (items, getInfo, getValue) => {
  const buckets = {};
  items.forEach((item) => {
    const info = getInfo(item);
    if (!info) return;
    const { key, label } = info;
    if (!buckets[key]) buckets[key] = { name: label, value: 0, sortKey: key };
    buckets[key].value = +(buckets[key].value + getValue(item)).toFixed(2);
  });
  return Object.values(buckets)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _, ...rest }) => rest);
};

// ─── Aggregator — count ────────────────────────────────────────────────────────
// Groups items into buckets and counts occurrences per bucket.
const aggregateCount = (items, getInfo) => {
  const buckets = {};
  items.forEach((item) => {
    const info = getInfo(item);
    if (!info) return;
    const { key, label } = info;
    if (!buckets[key]) buckets[key] = { name: label, value: 0, sortKey: key };
    buckets[key].value++;
  });
  return Object.values(buckets)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _, ...rest }) => rest);
};

// ─── Metric classification ────────────────────────────────────────────────────
const CURRENCY_METRICS  = new Set(['revenue', 'pendingAmount']);
const ATTENDANCE_METRIC = 'attendanceCount';

// ─── selectAnalyticsResult ────────────────────────────────────────────────────
// Primary analytics selector.
//
// Reads from:
//   - state.members       → member list
//   - state.payments      → payment list
//   - state.filters       → global plan / status context
//   - state.analytics     → metric, dimension, chartType, date range, isGenerated
//
// Returns:
//   {
//     data:            [{ name, value }, ...]   — normalized chart series
//     isCurrency:      boolean                  — format values as $
//     isReady:         boolean                  — false until Apply is clicked
//     isAttendanceStub:boolean                  — true when attendance not wired
//     total:           number
//     dataPoints:      number
//     max:             number
//   }
//
// NOTE: When attendanceSlice is integrated, replace the stub branch with:
//   const attendanceList = state.attendance.list;
//   and aggregate attendance records by dimension the same way as members.
export const selectAnalyticsResult = createSelector(
  selectMembersList,
  selectPaymentsList,
  selectFiltersState,
  selectAnalyticsState,
  (members, payments, filters, config) => {
    const { selectedMetric, selectedDimension, startDate, endDate, isGenerated } = config;

    const isCurrency      = CURRENCY_METRICS.has(selectedMetric);
    const isAttendanceStub = selectedMetric === ATTENDANCE_METRIC;

    const base = {
      isCurrency,
      isReady: isGenerated,
      isAttendanceStub,
      total: 0,
      dataPoints: 0,
      max: 0,
      data: [],
    };

    // Don't compute until user clicks Apply
    if (!isGenerated) return base;

    // Attendance: stub until attendanceSlice is added
    if (isAttendanceStub) return base;

    const startTs = startDate ? dayjs(startDate).valueOf() : null;
    const endTs   = endDate   ? dayjs(endDate).valueOf()   : null;

    // Global context filters from filterSlice
    const planFilter   = filters.plan;
    const statusFilter = filters.status;

    // Build member lookup map — O(1) access for payment → member joins
    const memberMap = {};
    members.forEach((m) => { memberMap[m.id] = m; });

    let data = [];

    // ── Revenue ───────────────────────────────────────────────────────────────
    // Source: paid payments, grouped by selected dimension.
    if (selectedMetric === 'revenue') {
      const source = payments.filter((p) => {
        if (p.status !== 'paid') return false;
        if (planFilter !== 'all' && p.planId !== planFilter) return false;
        if (!inRange(p.paymentDate, startTs, endTs)) return false;
        if (statusFilter !== 'all') {
          if ((memberMap[p.memberId]?.status ?? 'unknown') !== statusFilter) return false;
        }
        return true;
      });
      data = aggregateSum(
        source,
        (p) => getDimensionInfo(selectedDimension, 'payment', p, memberMap),
        (p) => p.amount,
      );
    }

    // ── Pending Amount ────────────────────────────────────────────────────────
    // Source: partial + due payments, grouped by selected dimension.
    else if (selectedMetric === 'pendingAmount') {
      const source = payments.filter((p) => {
        if (p.status !== 'partial' && p.status !== 'due') return false;
        if (planFilter !== 'all' && p.planId !== planFilter) return false;
        if (!inRange(p.paymentDate, startTs, endTs)) return false;
        if (statusFilter !== 'all') {
          if ((memberMap[p.memberId]?.status ?? 'unknown') !== statusFilter) return false;
        }
        return true;
      });
      data = aggregateSum(
        source,
        (p) => getDimensionInfo(selectedDimension, 'payment', p, memberMap),
        (p) => p.amount,
      );
    }

    // ── New Members ───────────────────────────────────────────────────────────
    // Source: all members (no status restriction), filtered by joiningDate.
    else if (selectedMetric === 'newMembers') {
      const source = members.filter((m) => {
        if (planFilter !== 'all' && m.planId !== planFilter) return false;
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (!inRange(m.joiningDate, startTs, endTs)) return false;
        return true;
      });
      data = aggregateCount(
        source,
        (m) => getDimensionInfo(selectedDimension, 'member', m, memberMap),
      );
    }

    // ── Active Members ────────────────────────────────────────────────────────
    // Source: active members only, filtered by joiningDate.
    else if (selectedMetric === 'activeMembers') {
      const source = members.filter((m) => {
        if (m.status !== 'active') return false;
        if (planFilter !== 'all' && m.planId !== planFilter) return false;
        if (!inRange(m.joiningDate, startTs, endTs)) return false;
        return true;
      });
      data = aggregateCount(
        source,
        (m) => getDimensionInfo(selectedDimension, 'member', m, memberMap),
      );
    }

    const total = data.reduce((s, d) => s + d.value, 0);
    const max   = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

    return { ...base, data, total: +total.toFixed(2), dataPoints: data.length, max };
  },
);

// ─── selectAnalyticsData ──────────────────────────────────────────────────────
// Convenience selector — returns only the normalized [{name, value}] array.
// Used when only the raw chart series is needed (e.g., DynamicChart preview).
export const selectAnalyticsData = createSelector(
  selectAnalyticsResult,
  (result) => result.data,
);
