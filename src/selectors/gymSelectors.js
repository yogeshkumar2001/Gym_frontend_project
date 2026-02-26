import { createSelector } from '@reduxjs/toolkit';

/**
 * selectIsNewGym — true when the gym has no plans AND no members.
 *
 * Used to show the welcome/onboarding card on the Dashboard instead of the
 * normal KPI/chart sections. Only resolves to true after both fetches have
 * completed so there is no premature empty-state flash during initial load.
 */
export const selectIsNewGym = createSelector(
  [
    (state) => state.members.list,
    (state) => state.plans.list,
    (state) => state.members.loading,
    (state) => state.plans.loading,
  ],
  (members, plans, membersLoading, plansLoading) =>
    !membersLoading && !plansLoading && members.length === 0 && plans.length === 0
);
