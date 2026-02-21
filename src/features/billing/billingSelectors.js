import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ── Raw slices ──────────────────────────────────────────────────────────────
const selectInvoiceList = (state) => state.billing.list;
const selectPaymentList = (state) => state.payments.list;
const selectFilters = (state) => state.filters;

// ─── selectInvoicesWithStatus ─────────────────────────────────────────────────
// Derives status from paymentId + dueDate — never stored in state.
// Logic:
//   paymentId present AND linked payment.status === 'paid'  → 'paid'
//   no paymentId OR payment not fully paid, dueDate past    → 'overdue'
//   else                                                    → 'unpaid'
export const selectInvoicesWithStatus = createSelector(
  [selectInvoiceList, selectPaymentList],
  (invoices, payments) =>
    invoices.map((inv) => {
      let status = 'unpaid';
      if (inv.paymentId) {
        const payment = payments.find((p) => p.id === inv.paymentId);
        if (payment && payment.status === 'paid') {
          status = 'paid';
        } else if (dayjs().isAfter(dayjs(inv.dueDate))) {
          status = 'overdue';
        }
      } else if (dayjs().isAfter(dayjs(inv.dueDate))) {
        status = 'overdue';
      }
      return { ...inv, status };
    })
);

// ─── selectFilteredInvoices ───────────────────────────────────────────────────
// Filters by search (memberName / invoiceNumber), status, and date range (issueDate).
export const selectFilteredInvoices = createSelector(
  [selectInvoicesWithStatus, selectFilters],
  (invoices, filters) => {
    const { startDate, endDate, status, search } = filters;
    const startTs = startDate ? dayjs(startDate).valueOf() : null;
    const endTs = endDate ? dayjs(endDate).endOf('day').valueOf() : null;

    return invoices.filter((inv) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !inv.memberName.toLowerCase().includes(q) &&
          !inv.invoiceNumber.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (status && status !== 'all' && inv.status !== status) return false;
      if (startTs || endTs) {
        const issueTs = dayjs(inv.issueDate).valueOf();
        if (startTs && issueTs < startTs) return false;
        if (endTs && issueTs > endTs) return false;
      }
      return true;
    });
  }
);

// ─── selectInvoiceStats ───────────────────────────────────────────────────────
export const selectInvoiceStats = createSelector(
  [selectInvoicesWithStatus],
  (invoices) => ({
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    unpaid: invoices.filter((inv) => inv.status === 'unpaid').length,
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    collectedAmount: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
  })
);
