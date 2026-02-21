import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Timestamp-based range check — no dayjs plugin required.
const inRange = (dateStr, startTs, endTs) => {
  if (!startTs || !endTs) return true;
  const ts = dayjs(dateStr).valueOf();
  return ts >= startTs && ts <= endTs;
};

// Consistent month bucket key (for sorting) and label (for display).
const monthKey = (dateStr) => dayjs(dateStr).format('YYYY-MM');
const monthLabel = (dateStr) => dayjs(dateStr).format("MMM 'YY");

// Sort an array of objects by their 'sortKey' field and strip that field.
const sortAndClean = (arr) =>
  arr
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _sk, ...rest }) => rest);

// ─── Base input selectors ─────────────────────────────────────────────────────
const selectMembersList = (state) => state.members.list;
const selectPaymentsList = (state) => state.payments.list;
const selectFilters = (state) => state.filters;

// ─── 1. Dashboard Metric Cards ────────────────────────────────────────────────
// Returns all 6 KPI values in one memoized call.
// Each metric respects the global filter context as documented below.
export const selectDashboardMetrics = createSelector(
  selectMembersList,
  selectPaymentsList,
  selectFilters,
  (members, payments, filters) => {
    const startTs = filters.startDate ? dayjs(filters.startDate).valueOf() : null;
    const endTs = filters.endDate ? dayjs(filters.endDate).valueOf() : null;

    // Members filtered by joiningDate range + status + plan
    const filteredMembers = members.filter((m) => {
      const dateOk = inRange(m.joiningDate, startTs, endTs);
      const statusOk = filters.status === 'all' || m.status === filters.status;
      const planOk = filters.plan === 'all' || m.planId === filters.plan;
      return dateOk && statusOk && planOk;
    });

    // Payments filtered by paymentDate range + plan
    const filteredPayments = payments.filter((p) => {
      const dateOk = inRange(p.paymentDate, startTs, endTs);
      const planOk = filters.plan === 'all' || p.planId === filters.plan;
      return dateOk && planOk;
    });

    // Upcoming renewals: always a forward-looking 7-day window on ALL members.
    // Plan filter applies; date range filter does NOT (it's a live widget).
    const now = dayjs().valueOf();
    const in7Days = dayjs().add(7, 'day').valueOf();
    const upcomingRenewals = members.filter((m) => {
      const expiry = dayjs(m.expiryDate).valueOf();
      const planOk = filters.plan === 'all' || m.planId === filters.plan;
      return m.status === 'active' && expiry > now && expiry <= in7Days && planOk;
    }).length;

    // Revenue: if date range selected, use filtered range; else current month.
    const revenuePayments =
      startTs && endTs
        ? filteredPayments
        : payments.filter((p) => {
            const ts = dayjs(p.paymentDate).valueOf();
            const mStart = dayjs().startOf('month').valueOf();
            const mEnd = dayjs().endOf('month').valueOf();
            const planOk = filters.plan === 'all' || p.planId === filters.plan;
            return ts >= mStart && ts <= mEnd && planOk;
          });

    return {
      totalMembers: filteredMembers.length,
      activeMembers: filteredMembers.filter((m) => m.status === 'active').length,
      expiredMembers: filteredMembers.filter((m) => m.status === 'expired').length,
      pendingAmount: filteredPayments
        .filter((p) => p.status === 'partial' || p.status === 'due')
        .reduce((sum, p) => sum + p.amount, 0),
      upcomingRenewals,
      revenue: revenuePayments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
    };
  }
);

// ─── 2. Member Growth Data ────────────────────────────────────────────────────
// LineChart — members joined per month.
// Respects: date range (joiningDate), plan filter.
export const selectMemberGrowthData = createSelector(
  selectMembersList,
  selectFilters,
  (members, filters) => {
    const startTs = filters.startDate ? dayjs(filters.startDate).valueOf() : null;
    const endTs = filters.endDate ? dayjs(filters.endDate).valueOf() : null;

    const buckets = {};
    members.forEach((m) => {
      const planOk = filters.plan === 'all' || m.planId === filters.plan;
      if (!planOk) return;
      if (!inRange(m.joiningDate, startTs, endTs)) return;

      const sk = monthKey(m.joiningDate);
      if (!buckets[sk]) buckets[sk] = { sortKey: sk, month: monthLabel(m.joiningDate), members: 0 };
      buckets[sk].members++;
    });

    return sortAndClean(Object.values(buckets));
  }
);

// ─── 3. Member Status Distribution ───────────────────────────────────────────
// PieChart (Donut) — active / expired / inactive breakdown.
// Always computed on all members (date range doesn't apply to status snapshot).
// Plan filter applies.
export const selectMemberStatusData = createSelector(
  selectMembersList,
  selectFilters,
  (members, filters) => {
    const counts = { Active: 0, Expired: 0, Inactive: 0 };
    members.forEach((m) => {
      const planOk = filters.plan === 'all' || m.planId === filters.plan;
      if (!planOk) return;
      if (m.status === 'active') counts.Active++;
      else if (m.status === 'expired') counts.Expired++;
      else if (m.status === 'inactive') counts.Inactive++;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }
);

// ─── 4. Revenue Trend Data ────────────────────────────────────────────────────
// BarChart — paid revenue per month.
// Respects: date range (paymentDate), plan filter.
export const selectRevenueTrendData = createSelector(
  selectPaymentsList,
  selectFilters,
  (payments, filters) => {
    const startTs = filters.startDate ? dayjs(filters.startDate).valueOf() : null;
    const endTs = filters.endDate ? dayjs(filters.endDate).valueOf() : null;

    const buckets = {};
    payments.forEach((p) => {
      if (p.status !== 'paid') return;
      const planOk = filters.plan === 'all' || p.planId === filters.plan;
      if (!planOk) return;
      if (!inRange(p.paymentDate, startTs, endTs)) return;

      const sk = monthKey(p.paymentDate);
      if (!buckets[sk]) buckets[sk] = { sortKey: sk, month: monthLabel(p.paymentDate), revenue: 0 };
      buckets[sk].revenue = +(buckets[sk].revenue + p.amount).toFixed(2);
    });

    return sortAndClean(Object.values(buckets));
  }
);

// ─── 5. Renewal Forecast Data ─────────────────────────────────────────────────
// BarChart — active members expiring in 0–30 days, bucketed by week.
// Plan filter applies. Date range filter intentionally excluded (forward-looking).
export const selectRenewalData = createSelector(
  selectMembersList,
  selectFilters,
  (members, filters) => {
    const now = dayjs();
    const buckets = [
      { week: '0–7 days', days: [0, 7], renewals: 0 },
      { week: '8–14 days', days: [8, 14], renewals: 0 },
      { week: '15–21 days', days: [15, 21], renewals: 0 },
      { week: '22–30 days', days: [22, 30], renewals: 0 },
    ];

    members.forEach((m) => {
      if (m.status !== 'active') return;
      const planOk = filters.plan === 'all' || m.planId === filters.plan;
      if (!planOk) return;

      const daysLeft = dayjs(m.expiryDate).diff(now, 'day');
      if (daysLeft < 0 || daysLeft > 30) return;

      const bucket = buckets.find((b) => daysLeft >= b.days[0] && daysLeft <= b.days[1]);
      if (bucket) bucket.renewals++;
    });

    return buckets.map(({ days: _d, ...rest }) => rest);
  }
);

// ─── 6. Fee Breakdown Data ────────────────────────────────────────────────────
// Stacked BarChart — paid vs pending amounts per month.
// Respects: date range (paymentDate), plan filter.
export const selectFeeBreakdownData = createSelector(
  selectPaymentsList,
  selectFilters,
  (payments, filters) => {
    const startTs = filters.startDate ? dayjs(filters.startDate).valueOf() : null;
    const endTs = filters.endDate ? dayjs(filters.endDate).valueOf() : null;

    const buckets = {};
    payments.forEach((p) => {
      const planOk = filters.plan === 'all' || p.planId === filters.plan;
      if (!planOk) return;
      if (!inRange(p.paymentDate, startTs, endTs)) return;

      const sk = monthKey(p.paymentDate);
      if (!buckets[sk]) {
        buckets[sk] = { sortKey: sk, month: monthLabel(p.paymentDate), paid: 0, pending: 0 };
      }
      if (p.status === 'paid') {
        buckets[sk].paid = +(buckets[sk].paid + p.amount).toFixed(2);
      } else {
        buckets[sk].pending = +(buckets[sk].pending + p.amount).toFixed(2);
      }
    });

    return sortAndClean(Object.values(buckets));
  }
);

// ─── Retained from Payments page (still exported for backward compat) ─────────
export const selectTotalRevenue = createSelector(selectPaymentsList, (payments) =>
  payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
);

export const selectMonthlyRevenue = createSelector(selectPaymentsList, (payments) => {
  const start = dayjs().startOf('month').valueOf();
  const end = dayjs().endOf('month').valueOf();
  return payments
    .filter((p) => {
      const ts = dayjs(p.paymentDate).valueOf();
      return p.status === 'paid' && ts >= start && ts <= end;
    })
    .reduce((sum, p) => sum + p.amount, 0);
});

export const selectPendingAmount = createSelector(selectPaymentsList, (payments) =>
  payments.filter((p) => p.status === 'partial' || p.status === 'due').reduce((sum, p) => sum + p.amount, 0)
);

export const selectUpcomingRenewalsCount = createSelector(selectMembersList, (members) => {
  const now = dayjs().valueOf();
  const in30Days = dayjs().add(30, 'day').valueOf();
  return members.filter((m) => {
    const expiry = dayjs(m.expiryDate).valueOf();
    return m.status === 'active' && expiry > now && expiry <= in30Days;
  }).length;
});

export const selectPaidPaymentsCount = createSelector(
  selectPaymentsList,
  (payments) => payments.filter((p) => p.status === 'paid').length
);
