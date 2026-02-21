// ─── Payment Status ───────────────────────────────────────────────────────────
export const PAYMENT_STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'green' },
  partial: { label: 'Partial', color: 'orange' },
  due: { label: 'Due', color: 'red' },
};

// In the "Record Payment" form, only Paid / Partial are user-selectable.
// 'due' is system-computed from overdue dates.
export const FORM_PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
];

// For GlobalFilters status dropdown on the Payments page
export const PAYMENT_FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'due', label: 'Due' },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHOD_CONFIG = {
  cash: { label: 'Cash', color: 'default' },
  upi: { label: 'UPI', color: 'blue' },
  card: { label: 'Card', color: 'purple' },
};

export const FORM_PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
];
