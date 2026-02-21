import { createSelector } from '@reduxjs/toolkit';
import { isInRange } from '../../utils/dateUtils';

// ─── Base Selectors ───────────────────────────────────────────────────────────
const selectMembersList = (state) => state.members.list;
const selectFilters = (state) => state.filters;

// ─── Derived Selectors ────────────────────────────────────────────────────────
export const selectMembersLoading = (state) => state.members.loading;
export const selectMembersError = (state) => state.members.error;
export const selectTotalCount = (state) => state.members.list.length;

// ─── Filtered Members (memoized) ──────────────────────────────────────────────
// Recomputes only when members list or filter values change.
// Mirrors the server-side query:  GET /members?startDate&endDate&status&planId&search
export const selectFilteredMembers = createSelector(
  selectMembersList,
  selectFilters,
  (members, filters) => {
    let result = members;

    // Text search — name, email, phone
    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.phone.includes(term)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((m) => m.status === filters.status);
    }

    // Plan filter
    if (filters.plan !== 'all') {
      result = result.filter((m) => m.planId === filters.plan);
    }

    // Date range filter on joiningDate
    if (filters.startDate && filters.endDate) {
      result = result.filter((m) =>
        isInRange(m.joiningDate, filters.startDate, filters.endDate)
      );
    }

    return result;
  }
);

// ─── Stat Selectors (for Dashboard use later) ─────────────────────────────────
export const selectActiveMembersCount = createSelector(
  selectMembersList,
  (members) => members.filter((m) => m.status === 'active').length
);

export const selectExpiredMembersCount = createSelector(
  selectMembersList,
  (members) => members.filter((m) => m.status === 'expired').length
);

export const selectTotalRevenue = createSelector(
  selectMembersList,
  (members) => members.reduce((acc, m) => acc + m.feeAmount, 0)
);
