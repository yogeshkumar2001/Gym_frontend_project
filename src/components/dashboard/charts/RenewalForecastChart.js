import React from 'react';
import { Card, Empty, Typography, Badge } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { colors } from '../../../theme/theme';

const { Text } = Typography;

const axisStyle = { fill: colors.textSecondary, fontSize: 12 };
const gridStyle = { stroke: colors.border, strokeDasharray: '3 3' };
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 },
};

// Gradient urgency — bars get more intense towards the soonest week
const BAR_COLORS = [colors.error, '#F97316', '#EAB308', colors.success];

// ─── RenewalForecastChart ─────────────────────────────────────────────────────
// BarChart — active members grouped by how many days until their plan expires.
// Helps gym staff plan follow-up calls / WhatsApp reminders.
// Receives pre-computed `data` from selectRenewalData selector.
const RenewalForecastChart = ({ data }) => {
  const total = data ? data.reduce((sum, d) => sum + d.renewals, 0) : 0;
  const hasData = total > 0;

  return (
    <Card
      title="Upcoming Renewals (30 days)"
      extra={
        hasData ? (
          <Badge count={total} color={colors.warning} overflowCount={999} />
        ) : null
      }
    >
      {!hasData ? (
        <Empty
          description={<Text type="secondary">No upcoming renewals</Text>}
          style={{ padding: '32px 0' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="week" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [`${value} member${value !== 1 ? 's' : ''}`, 'Renewing']}
            />
            <Bar dataKey="renewals" name="Renewals" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i] ?? colors.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RenewalForecastChart;
