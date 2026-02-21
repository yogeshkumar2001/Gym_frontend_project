// ─── Invoice Status ────────────────────────────────────────────────────────────
export const INVOICE_STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'green' },
  unpaid: { label: 'Unpaid', color: 'orange' },
  overdue: { label: 'Overdue', color: 'red' },
};

// ─── Filter Options ────────────────────────────────────────────────────────────
export const INVOICE_FILTER_STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Overdue', value: 'overdue' },
];
