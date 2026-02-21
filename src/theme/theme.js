// ─── Centralized Color Palette ───────────────────────────────────────────────
// Change any value here and it propagates to the entire app.
export const colors = {
  primary: '#4F46E5',       // Indigo — main brand color
  secondary: '#7C3AED',     // Violet — secondary actions
  success: '#16A34A',       // Green
  warning: '#D97706',       // Amber
  error: '#DC2626',         // Red
  info: '#0284C7',          // Sky blue

  // Backgrounds
  background: '#F5F6FA',
  sidebarBg: '#1E1B4B',     // Deep indigo sidebar
  sidebarItemHover: '#312E81',
  cardBg: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
};

// ─── Ant Design v5 Theme Token Override ──────────────────────────────────────
export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    colorBgLayout: colors.background,
    colorBgContainer: colors.cardBg,
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorTextBase: colors.textPrimary,
    colorBorder: colors.border,
    boxShadow:
      '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  },
  components: {
    Menu: {
      darkItemBg: colors.sidebarBg,
      darkItemSelectedBg: colors.primary,
      darkItemHoverBg: colors.sidebarItemHover,
    },
    Card: {
      boxShadow:
        '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
    },
  },
};
