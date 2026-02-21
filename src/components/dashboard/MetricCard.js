import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { colors } from '../../theme/theme';

const { Text } = Typography;

const iconWrapperStyle = (color) => ({
  padding: 12,
  borderRadius: 10,
  background: `${color}18`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const cardBodyStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
};

// ─── MetricCard ───────────────────────────────────────────────────────────────
// A single KPI card used in the Dashboard metrics row.
// Props:
//   title      — card label
//   value      — numeric value
//   icon       — React node (Ant icon)
//   color      — hex color for value text + icon background tint
//   prefix     — string shown before value (e.g. '$')
//   suffix     — string shown after value
//   precision  — decimal places (default none)
//   hint       — small helper text below value
const MetricCard = ({ title, value, icon, color, prefix, suffix, precision, hint }) => (
  <Card hoverable size="small" style={{ height: '100%' }}>
    <div style={cardBodyStyle}>
      <div>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          {title}
        </Text>
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          precision={precision}
          valueStyle={{ color, fontWeight: 700, fontSize: 26, lineHeight: 1.2 }}
        />
        {hint && (
          <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
            {hint}
          </Text>
        )}
      </div>
      <div style={iconWrapperStyle(color ?? colors.primary)}>
        {icon}
      </div>
    </div>
  </Card>
);

export default MetricCard;
