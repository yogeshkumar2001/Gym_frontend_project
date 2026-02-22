import { createSelector } from '@reduxjs/toolkit';

// ─── Raw input selectors ───────────────────────────────────────────────────────
const selectPlansList    = (state) => state.plans.list;
const selectMembersList  = (state) => state.members.list;
const selectPaymentsList = (state) => state.payments.list;

// ─── selectPlanStats ──────────────────────────────────────────────────────────
// Enriches each plan with live computed stats from members + payments.
//
// Returns:
// {
//   plans: [
//     {
//       ...planFields,
//       activeMemberCount,   // members with matching planId + status 'active'
//       totalMemberCount,    // all members on this plan (any status)
//       revenue,             // sum of paid payments linked to this planId
//     },
//     ...
//   ],
//   summary: {
//     totalPlans,            // total plan records
//     activePlans,           // plans with status 'active'
//     mostPopular,           // plan object with highest activeMemberCount (or null)
//     highestRevenue,        // plan object with highest revenue (or null)
//   },
// }
//
// Backend integration: replace with GET /plans/stats and populate same shape.
export const selectPlanStats = createSelector(
  selectPlansList,
  selectMembersList,
  selectPaymentsList,
  (plans, members, payments) => {
    // Pre-filter paid payments once — used for all revenue calculations
    const paidPayments = payments.filter((p) => p.status === 'paid');

    // Enrich each plan with computed stats
    const enrichedPlans = plans.map((plan) => {
      const planMembers = members.filter((m) => m.planId === plan.id);

      const activeMemberCount = planMembers.filter(
        (m) => m.status === 'active',
      ).length;

      const totalMemberCount = planMembers.length;

      // Revenue: sum of all paid payments whose planId matches this plan.
      // Payments carry their own planId (set at time of payment) which is the
      // authoritative link — not member.planId which may have changed.
      const revenue = paidPayments
        .filter((p) => p.planId === plan.id)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        ...plan,
        activeMemberCount,
        totalMemberCount,
        revenue: +revenue.toFixed(2),
      };
    });

    // ── Summary stats ──────────────────────────────────────────────────────
    const totalPlans  = plans.length;
    const activePlans = plans.filter((p) => p.status === 'active').length;

    // Most popular = highest activeMemberCount among active plans
    const activePlanStats = enrichedPlans.filter((p) => p.status === 'active');

    const mostPopular = activePlanStats.length
      ? activePlanStats.reduce((best, p) =>
          p.activeMemberCount >= best.activeMemberCount ? p : best,
        )
      : null;

    const highestRevenue = enrichedPlans.length
      ? enrichedPlans.reduce((best, p) =>
          p.revenue >= best.revenue ? p : best,
        )
      : null;

    return {
      plans: enrichedPlans,
      summary: { totalPlans, activePlans, mostPopular, highestRevenue },
    };
  },
);

// Convenience selector — just the enriched plans array
export const selectEnrichedPlans = createSelector(
  selectPlanStats,
  ({ plans }) => plans,
);
