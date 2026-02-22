import { createSlice } from '@reduxjs/toolkit';

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  autoExpiryEnabled:  false,
  autoPaymentEnabled: false,
  reminderDays:       3,
  // Tracks simulated "sent" reminders: [{ memberId, type, sentAt }]
  // type: 'expiry' | 'payment'
  sentReminders: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setAutoExpiryEnabled:  (state, action) => { state.autoExpiryEnabled  = action.payload; },
    setAutoPaymentEnabled: (state, action) => { state.autoPaymentEnabled = action.payload; },
    setReminderDays:       (state, action) => { state.reminderDays       = action.payload; },

    // Record a simulated reminder send
    markReminderSent: (state, action) => {
      const { memberId, type } = action.payload;
      const exists = state.sentReminders.find(
        (r) => r.memberId === memberId && r.type === type
      );
      if (!exists) {
        state.sentReminders.push({ memberId, type, sentAt: new Date().toISOString() });
      }
    },

    // Clear all sent reminder history (e.g. for a fresh cycle)
    clearSentReminders: (state) => {
      state.sentReminders = [];
    },
  },
});

export const {
  setAutoExpiryEnabled,
  setAutoPaymentEnabled,
  setReminderDays,
  markReminderSent,
  clearSentReminders,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
