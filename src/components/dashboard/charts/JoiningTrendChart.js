import React from 'react';
import { Card, Empty, Typography } from 'antd';
import {
  LineChart,
  Line,
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

// ─── JoiningTrendChart ────────────────────────────────────────────────────────
// LineChart — member join count per month.
// Receives pre-computed `data` from selectMemberGrowthData selector.
const JoiningTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Joining Trend">
        <Empty description={<Text type="secondary">No join data for selected filters</Text>} style={{ padding: '32px 0' }} />
      </Card>
    );
  }

  return (
    <Card title="Joining Trend" extra={<Text type="secondary">{data.length} month{data.length !== 1 ? 's' : ''}</Text>}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 40 }}>
          <CartesianGrid {...gridStyle} />
          <XAxis
            dataKey="month"
            tick={axisStyle}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tick={axisStyle} allowDecimals={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`${value} members`, 'Joined']}
          />
          <Legend verticalAlign="top" height={28} />
          <Line
            type="monotone"
            dataKey="members"
            name="New Members"
            stroke={colors.primary}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.primary }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default JoiningTrendChart;
