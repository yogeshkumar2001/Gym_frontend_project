import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// ─── Base input selectors ──────────────────────────────────────────────────────
const selectMembersList       = (state) => state.members.list;
const selectPaymentsList      = (state) => state.payments.list;
const selectFilters           = (state) => state.filters;
const selectNotifications     = (state) => state.notifications;

// ─── Settings shortcut ────────────────────────────────────────────────────────
export const selectNotificationSettings = createSelector(
  selectNotifications,
  ({ autoExpiryEnabled, autoPaymentEnabled, reminderDays }) => ({
    autoExpiryEnabled,
    autoPaymentEnabled,
    reminderDays,
  })
);

export const selectSentReminders = (state) => state.notifications.sentReminders;

// ─── Helper: check if a reminder was already sent ─────────────────────────────
export const selectIsReminderSent = (memberId, type) =>
  createSelector(selectSentReminders, (sent) =>
    sent.some((r) => r.memberId === memberId && r.type === type)
  );

// ─── 1. selectExpiringMembers ─────────────────────────────────────────────────
// Returns active members whose expiryDate falls within the reminder window.
//
// Window logic:
//   - If filterSlice has a date range → use that as the expiry date range
//   - Otherwise → use [today, today + reminderDays]
//
// Also respects: status filter, plan filter, search (name / phone)
export const selectExpiringMembers = createSelector(
  selectMembersList,
  selectFilters,
  selectNotifications,
  (members, filters, notifications) => {
    const now        = dayjs();
    const days       = notifications.reminderDays || 3;
    const startTs    = filters.startDate ? dayjs(filters.startDate).valueOf() : now.valueOf();
    const endTs      = filters.endDate
      ? dayjs(filters.endDate).endOf('day').valueOf()
      : now.add(days, 'day').endOf('day').valueOf();

    const searchTerm = (filters.search || '').toLowerCase();

    return members
      .filter((m) => {
        const expiryTs = dayjs(m.expiryDate).valueOf();

        const dateOk   = expiryTs >= startTs && expiryTs <= endTs;
        const statusOk = filters.status === 'all' || m.status === filters.status;
        const planOk   = filters.plan   === 'all' || m.planId === filters.plan;
        const searchOk = !searchTerm ||
          m.name.toLowerCase().includes(searchTerm) ||
          (m.phone || '').includes(searchTerm) ||
          (m.email || '').toLowerCase().includes(searchTerm);

        return dateOk && statusOk && planOk && searchOk;
      })
      .map((m) => ({
        ...m,
        daysRemaining: dayjs(m.expiryDate).diff(now, 'day'),
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining); // most urgent first
  }
);

// ─── 2. selectOverduePayments ─────────────────────────────────────────────────
// Returns payment records that are:
//   - status === 'due'
//   - OR status !== 'paid' AND nextDueDate is in the past
//
// Respects: plan filter, date range (on nextDueDate), search (memberName / phone)
export const selectOverduePayments = createSelector(
  selectPaymentsList,
  selectMembersList,
  selectFilters,
  (payments, members, filters) => {
    const now        = dayjs();
    const startTs    = filters.startDate ? dayjs(filters.startDate).valueOf() : null;
    const endTs      = filters.endDate   ? dayjs(filters.endDate).endOf('day').valueOf() : null;
    const searchTerm = (filters.search || '').toLowerCase();

    // Build a quick phone lookup
    const phoneByMemberId = {};
    members.forEach((m) => { phoneByMemberId[m.id] = m.phone || ''; });

    return payments.filter((p) => {
      const nextDueTs = dayjs(p.nextDueDate).valueOf();
      const isOverdue = p.status === 'due' ||
        (p.status === 'partial' && nextDueTs < now.valueOf());

      if (!isOverdue) return false;

      const planOk   = filters.plan === 'all' || p.planId === filters.plan;

      const dateOk   = !startTs || !endTs
        ? true
        : nextDueTs >= startTs && nextDueTs <= endTs;

      const phone    = phoneByMemberId[p.memberId] || '';
      const searchOk = !searchTerm ||
        (p.memberName || '').toLowerCase().includes(searchTerm) ||
        phone.includes(searchTerm);

      return planOk && dateOk && searchOk;
    });
  }
);

// ─── 3. selectReminderCandidates ──────────────────────────────────────────────
// Combined count for dashboard badges.
export const selectReminderCandidates = createSelector(
  selectExpiringMembers,
  selectOverduePayments,
  (expiring, overdue) => ({
    expiringCount: expiring.length,
    overdueCount:  overdue.length,
    total:         expiring.length + overdue.length,
  })
);

// ─── 4. Convenience count selectors (for Dashboard cards) ────────────────────
export const selectExpiringCount = createSelector(
  selectExpiringMembers,
  (members) => members.length
);

export const selectOverdueCount = createSelector(
  selectOverduePayments,
  (payments) => payments.length
);
