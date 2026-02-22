import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ─── Raw input selectors ───────────────────────────────────────────────────────
const selectMembersList  = (state) => state.members.list;
const selectPaymentsList = (state) => state.payments.list;
const selectFiltersState = (state) => state.filters;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Strict range check using Unix timestamps — avoids dayjs plugin dependency.
const inPeriod = (dateStr, startTs, endTs) => {
  const ts = dayjs(dateStr).valueOf();
  return ts >= startTs && ts <= endTs;
};

// Safe growth percentage — returns 100 when prev=0 and current>0, else 0.
const growthPct = (current, prev) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return +((current - prev) / prev * 100).toFixed(1);
};

// ─── Period resolver ──────────────────────────────────────────────────────────
// Determines current / previous / yoy comparison windows.
//
// When a filter date range is set:
//   current  = the selected date range
//   previous = equal-length window immediately before the selected start
//   yoy      = same selected window shifted back exactly one year
//
// When no filter date range:
//   current  = current calendar month
//   previous = previous calendar month
//   yoy      = same calendar month last year
const buildPeriods = (filters) => {
  const now = dayjs();
  let currentStart, currentEnd;

  if (filters.startDate && filters.endDate) {
    currentStart = dayjs(filters.startDate);
    currentEnd   = dayjs(filters.endDate);
  } else {
    currentStart = now.startOf('month');
    currentEnd   = now.endOf('month');
  }

  const periodDays = currentEnd.diff(currentStart, 'day') + 1;

  // Previous period: same length, ending the day before current start
  const prevEnd   = currentStart.subtract(1, 'day').endOf('day');
  const prevStart = prevEnd.subtract(periodDays - 1, 'day').startOf('day');

  // Year-over-year: same window shifted back 1 year
  const yoyStart = currentStart.subtract(1, 'year');
  const yoyEnd   = currentEnd.subtract(1, 'year');

  const hasCustomRange = !!(filters.startDate && filters.endDate);

  return {
    current: { startTs: currentStart.valueOf(), endTs: currentEnd.valueOf() },
    prev:    { startTs: prevStart.valueOf(),    endTs: prevEnd.valueOf()    },
    yoy:     { startTs: yoyStart.valueOf(),     endTs: yoyEnd.valueOf()     },
    // Labels surfaced to the UI for context sub-text
    momLabel: hasCustomRange ? 'vs. Prior Period'          : 'vs. Previous Month',
    yoyLabel: hasCustomRange ? 'vs. Same Period Last Year' : 'vs. Same Month Last Year',
  };
};

// ─── selectMetaKPIs ───────────────────────────────────────────────────────────
// Computes five executive-level KPIs from members + payments state.
//
// All calculation logic lives here — zero computation in components.
//
// Returns:
// {
//   revenueMoM:    { value, previousValue, change, trend, isGood, ... }
//   revenueYoY:    { value, previousValue, change, trend, isGood, ... }
//   memberGrowth:  { value, previousValue, change, trend, isGood, ... }
//   churnRate:     { value, change, trend, isGood, isAvailable, detail }
//   renewalRate:   { value, change, trend, isGood, isAvailable, detail }
// }
//
// Backend integration: replace these computations with a single
//   GET /dashboard/meta-kpis?startDate&endDate&plan&status
// and populate the same shape from the response.
export const selectMetaKPIs = createSelector(
  selectMembersList,
  selectPaymentsList,
  selectFiltersState,
  (members, payments, filters) => {
    const { current, prev, yoy, momLabel, yoyLabel } = buildPeriods(filters);

    // Plan filter applies where relevant (members and payments).
    // Status filter is not applied here — meta KPIs measure the full member
    // base to keep comparative rates meaningful across periods.
    const planFilter = filters.plan;

    // Paid payments are the source for revenue metrics
    const paidPayments = payments.filter(
      (p) => p.status === 'paid' &&
             (planFilter === 'all' || p.planId === planFilter),
    );

    // ── Revenue MoM ───────────────────────────────────────────────────────────
    const currentRevenue = paidPayments
      .filter((p) => inPeriod(p.paymentDate, current.startTs, current.endTs))
      .reduce((sum, p) => sum + p.amount, 0);

    const prevRevenue = paidPayments
      .filter((p) => inPeriod(p.paymentDate, prev.startTs, prev.endTs))
      .reduce((sum, p) => sum + p.amount, 0);

    const momChange = growthPct(currentRevenue, prevRevenue);

    // ── Revenue YoY ───────────────────────────────────────────────────────────
    const yoyRevenue = paidPayments
      .filter((p) => inPeriod(p.paymentDate, yoy.startTs, yoy.endTs))
      .reduce((sum, p) => sum + p.amount, 0);

    const yoyChange = growthPct(currentRevenue, yoyRevenue);

    // ── Member Growth Rate ─────────────────────────────────────────────────────
    // New members joined in the current period vs. the previous period.
    const filteredMembers = members.filter(
      (m) => planFilter === 'all' || m.planId === planFilter,
    );

    const newMembersCurrent = filteredMembers.filter(
      (m) => inPeriod(m.joiningDate, current.startTs, current.endTs),
    ).length;

    const newMembersPrev = filteredMembers.filter(
      (m) => inPeriod(m.joiningDate, prev.startTs, prev.endTs),
    ).length;

    const memberGrowthChange = growthPct(newMembersCurrent, newMembersPrev);

    // ── Churn Rate ────────────────────────────────────────────────────────────
    // Churn = members whose plan expired inside the period
    //         ÷ members who existed at period start (joined before start)
    //
    // Status filter respected: if 'expired' is explicitly selected, that is
    // the target population; otherwise all statuses contribute to the base.
    const baseMembers = filteredMembers.filter(
      (m) => dayjs(m.joiningDate).valueOf() < current.startTs,
    );

    const expiredInPeriod = filteredMembers.filter(
      (m) => m.status === 'expired' &&
             inPeriod(m.expiryDate, current.startTs, current.endTs),
    );

    const churnBase    = baseMembers.length;
    const churnCount   = expiredInPeriod.length;
    const churnCurrent = churnBase > 0 ? +((churnCount / churnBase) * 100).toFixed(2) : 0;

    // Previous period churn (for trend comparison)
    const prevBaseMembers = filteredMembers.filter(
      (m) => dayjs(m.joiningDate).valueOf() < prev.startTs,
    );
    const prevExpiredInPeriod = filteredMembers.filter(
      (m) => m.status === 'expired' &&
             inPeriod(m.expiryDate, prev.startTs, prev.endTs),
    );
    const prevChurnBase  = prevBaseMembers.length;
    const churnPrev      = prevChurnBase > 0
      ? +((prevExpiredInPeriod.length / prevChurnBase) * 100).toFixed(2)
      : 0;

    // Change in percentage points (not %-of-%)
    const churnChange = +(churnCurrent - churnPrev).toFixed(2);

    // ── Renewal Rate ──────────────────────────────────────────────────────────
    // Members whose expiryDate falls in the current period (up for renewal)
    const expiringThisPeriod = filteredMembers.filter(
      (m) => inPeriod(m.expiryDate, current.startTs, current.endTs),
    );
    const expiringIds = new Set(expiringThisPeriod.map((m) => m.id));

    // Of those expiring members, count distinct ones who made a paid payment
    // in the same period (indicating they renewed their membership).
    const renewedIds = new Set(
      paidPayments
        .filter(
          (p) => expiringIds.has(p.memberId) &&
                 inPeriod(p.paymentDate, current.startTs, current.endTs),
        )
        .map((p) => p.memberId),
    );

    const expiringCount  = expiringThisPeriod.length;
    const renewedCount   = renewedIds.size;
    const renewalCurrent = expiringCount > 0
      ? +((renewedCount / expiringCount) * 100).toFixed(1)
      : 0;

    // Previous period renewal (for trend)
    const expiringPrevPeriod = filteredMembers.filter(
      (m) => inPeriod(m.expiryDate, prev.startTs, prev.endTs),
    );
    const expiringPrevIds = new Set(expiringPrevPeriod.map((m) => m.id));
    const renewedPrevIds  = new Set(
      paidPayments
        .filter(
          (p) => expiringPrevIds.has(p.memberId) &&
                 inPeriod(p.paymentDate, prev.startTs, prev.endTs),
        )
        .map((p) => p.memberId),
    );
    const renewalPrev = expiringPrevPeriod.length > 0
      ? +((renewedPrevIds.size / expiringPrevPeriod.length) * 100).toFixed(1)
      : 0;

    const renewalChange = +(renewalCurrent - renewalPrev).toFixed(1);

    // ── Assemble result ───────────────────────────────────────────────────────
    return {
      // Revenue Month-over-Month
      revenueMoM: {
        value:          +currentRevenue.toFixed(2),
        previousValue:  +prevRevenue.toFixed(2),
        change:         momChange,                       // % growth
        trend:          currentRevenue >= prevRevenue ? 'up' : 'down',
        isGood:         momChange >= 0,                  // higher revenue = good
        higherIsBetter: true,
        comparisonLabel: momLabel,
        isAvailable:    true,
        isCurrency:     true,
        subline:        `Prev: $${prevRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },

      // Revenue Year-over-Year
      revenueYoY: {
        value:          +currentRevenue.toFixed(2),
        previousValue:  +yoyRevenue.toFixed(2),
        change:         yoyChange,
        trend:          currentRevenue >= yoyRevenue ? 'up' : 'down',
        isGood:         yoyChange >= 0,
        higherIsBetter: true,
        comparisonLabel: yoyLabel,
        isAvailable:    true,
        isCurrency:     true,
        subline:        `Prior yr: $${yoyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },

      // New Member Growth Rate
      memberGrowth: {
        value:          newMembersCurrent,
        previousValue:  newMembersPrev,
        change:         memberGrowthChange,              // % growth in new joins
        trend:          newMembersCurrent >= newMembersPrev ? 'up' : 'down',
        isGood:         memberGrowthChange >= 0,
        higherIsBetter: true,
        comparisonLabel: momLabel,
        isAvailable:    true,
        isCurrency:     false,
        subline:        `Prev: ${newMembersPrev} new member${newMembersPrev !== 1 ? 's' : ''}`,
      },

      // Churn Rate — lower is better
      churnRate: {
        value:          churnCurrent,                    // % of base that churned
        previousValue:  churnPrev,
        change:         churnChange,                     // Δ percentage points
        trend:          churnCurrent <= churnPrev ? 'down' : 'up',
        isGood:         churnChange <= 0,                // less churn = good
        higherIsBetter: false,
        comparisonLabel: momLabel,
        isAvailable:    churnBase > 0,
        isCurrency:     false,
        isPercent:      true,
        subline:        `${churnCount} of ${churnBase} members expired`,
        isPpChange:     true,                            // change is percentage points, not %
      },

      // Renewal Rate — higher is better
      renewalRate: {
        value:          renewalCurrent,                  // % of expiring that renewed
        previousValue:  renewalPrev,
        change:         renewalChange,                   // Δ percentage points
        trend:          renewalCurrent >= renewalPrev ? 'up' : 'down',
        isGood:         renewalChange >= 0,
        higherIsBetter: true,
        comparisonLabel: momLabel,
        isAvailable:    expiringCount > 0,
        isCurrency:     false,
        isPercent:      true,
        subline:        `${renewedCount} of ${expiringCount} renewed`,
        isPpChange:     true,
      },
    };
  },
);
