import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import membersReducer from '../features/members/membersSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import plansReducer from '../features/plans/plansSlice';
import filtersReducer from '../features/filters/filterSlice';
import billingReducer from '../features/billing/billingSlice';
import importReducer from '../features/import/importSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import workoutsReducer from '../features/workouts/workoutsSlice';
import dietsReducer    from '../features/diets/dietsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    payments: paymentsReducer,
    dashboard: dashboardReducer,
    plans: plansReducer,
    filters: filtersReducer,
    billing: billingReducer,
    import: importReducer,
    notifications: notificationsReducer,
    analytics: analyticsReducer,
    workouts:  workoutsReducer,
    diets:     dietsReducer,
  },
});
