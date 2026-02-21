import React from 'react';
import { Card, Empty, Typography } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { colors } from '../../../theme/theme';

const { Text } = Typography;

const axisStyle = { fill: colors.textSecondary, fontSize: 12 };
const gridStyle = { stroke: colors.border, strokeDasharray: '3 3' };
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 },
};

const currencyFormatter = (value) =>
  `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ─── FeeBreakdownChart ────────────────────────────────────────────────────────
// Stacked BarChart — paid vs pending fee amounts per month.
// Gives a quick view of collection efficiency per period.
// Receives pre-computed `data` from selectFeeBreakdownData selector.
const FeeBreakdownChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Fee Collection Breakdown">
        <Empty description={<Text type="secondary">No payment data for selected filters</Text>} style={{ padding: '32px 0' }} />
      </Card>
    );
  }

  const totalPaid = data.reduce((sum, d) => sum + d.paid, 0);
  const totalPending = data.reduce((sum, d) => sum + d.pending, 0);

  return (
    <Card
      title="Fee Collection Breakdown"
      extra={
        <Text type="secondary">
          Collected: <Text strong style={{ color: colors.success }}>${totalPaid.toFixed(0)}</Text>
          &nbsp;·&nbsp;
          Pending: <Text strong style={{ color: colors.warning }}>${totalPending.toFixed(0)}</Text>
        </Text>
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="month"
            tick={axisStyle}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tick={{ ...axisStyle, fontSize: 11 }} tickFormatter={currencyFormatter} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [
              `$${Number(value).toFixed(2)}`,
              name === 'paid' ? 'Collected' : 'Pending',
            ]}
          />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value) => (
              <Text style={{ fontSize: 13 }}>
                {value === 'paid' ? 'Collected' : 'Pending / Due'}
              </Text>
            )}
          />
          <Bar dataKey="paid" name="paid" stackId="a" fill={colors.success} fillOpacity={0.88} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="pending" name="pending" stackId="a" fill={colors.warning} fillOpacity={0.88} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default FeeBreakdownChart;
