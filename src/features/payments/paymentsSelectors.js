import { createSelector } from '@reduxjs/toolkit';
import { isInRange } from '../../utils/dateUtils';

// ─── Base ─────────────────────────────────────────────────────────────────────
const selectPaymentsList = (state) => state.payments.list;
const selectFilters = (state) => state.filters;

// ─── Simple selectors ─────────────────────────────────────────────────────────
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsCount = (state) => state.payments.list.length;

// ─── Filtered Payments (memoized) ─────────────────────────────────────────────
// Mirrors future server query:  GET /payments?startDate&endDate&status&planId&search
// Filtering is NEVER done inside components — only here.
export const selectFilteredPayments = createSelector(
  selectPaymentsList,
  selectFilters,
  (payments, filters) => {
    let result = payments;

    // Text search — member name only for payments
    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      result = result.filter((p) =>
        p.memberName.toLowerCase().includes(term)
      );
    }

    // Status filter (paid / partial / due)
    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }

    // Plan filter
    if (filters.plan !== 'all') {
      result = result.filter((p) => p.planId === filters.plan);
    }

    // Date range filter on paymentDate
    if (filters.startDate && filters.endDate) {
      result = result.filter((p) =>
        isInRange(p.paymentDate, filters.startDate, filters.endDate)
      );
    }

    return result;
  }
);
