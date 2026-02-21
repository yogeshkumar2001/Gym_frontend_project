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
  Cell,
} from 'recharts';
import { colors } from '../../../theme/theme';

const { Text } = Typography;

const axisStyle = { fill: colors.textSecondary, fontSize: 12 };
const gridStyle = { stroke: colors.border, strokeDasharray: '3 3' };

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 },
};

const currencyTick = (value) => `$${(value / 1000).toFixed(0)}k`;

// ─── RevenueTrendChart ────────────────────────────────────────────────────────
// BarChart — collected revenue per month.
// Receives pre-computed `data` from selectRevenueTrendData selector.
const RevenueTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Revenue Trend">
        <Empty description={<Text type="secondary">No revenue data for selected filters</Text>} style={{ padding: '32px 0' }} />
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <Card
      title="Revenue Trend"
      extra={<Text type="secondary">Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="month"
            tick={axisStyle}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tick={{ ...axisStyle, fontSize: 11 }} tickFormatter={currencyTick} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
          />
          <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors.primary} fillOpacity={0.85 - i * 0.01} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueTrendChart;
