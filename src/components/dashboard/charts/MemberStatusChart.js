import React from 'react';
import { Card, Empty, Typography } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { colors } from '../../../theme/theme';

const { Text } = Typography;

// Fixed colour order matching selector output: Active, Expired, Inactive
const SLICE_COLORS = {
  Active: colors.success,
  Expired: colors.error,
  Inactive: colors.textSecondary,
};

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 },
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── MemberStatusChart ────────────────────────────────────────────────────────
// Donut PieChart — member status distribution.
// Receives pre-computed `data` from selectMemberStatusData selector.
const MemberStatusChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Member Status">
        <Empty description={<Text type="secondary">No data available</Text>} style={{ padding: '32px 0' }} />
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card
      title="Member Status"
      extra={<Text type="secondary">{total} total</Text>}
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={68}
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SLICE_COLORS[entry.name] ?? colors.primary} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [`${value} members`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            formatter={(value) => <Text style={{ fontSize: 13 }}>{value}</Text>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MemberStatusChart;
