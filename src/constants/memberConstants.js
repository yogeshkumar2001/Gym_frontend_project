// ─── Plan Configuration ───────────────────────────────────────────────────────
// Single source of truth for plan metadata used across the app.
export const PLAN_CONFIG = {
  monthly: {
    name: 'Monthly',
    months: 1,
    defaultFee: 49.99,
    color: 'blue',
  },
  quarterly: {
    name: 'Quarterly',
    months: 3,
    defaultFee: 129.99,
    color: 'purple',
  },
  annually: {
    name: 'Annually',
    months: 12,
    defaultFee: 449.99,
    color: 'gold',
  },
};

// For form dropdowns — includes months + fee for auto-fill
export const FORM_PLAN_OPTIONS = Object.entries(PLAN_CONFIG).map(
  ([value, cfg]) => ({
    value,
    label: cfg.name,
    months: cfg.months,
    defaultFee: cfg.defaultFee,
  })
);

// ─── Status Configuration ─────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  active: { label: 'Active', color: 'green' },
  expired: { label: 'Expired', color: 'red' },
  inactive: { label: 'Inactive', color: 'default' },
};

export const FORM_STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);
