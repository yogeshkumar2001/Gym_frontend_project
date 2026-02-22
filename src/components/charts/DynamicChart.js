import React from 'react';
import { Empty, Typography } from 'antd';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart,  Bar,
  PieChart,  Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Chart palette ────────────────────────────────────────────────────────────
// Ordered to be visually distinct and accessible
const CHART_COLORS = [
  colors.primary,    // #4F46E5
  colors.success,    // #16A34A
  colors.warning,    // #D97706
  colors.secondary,  // #7C3AED
  colors.info,       // #0284C7
  colors.error,      // #DC2626
];

// ─── Shared axis / grid / tooltip styles ─────────────────────────────────────
const axisStyle  = { fill: colors.textSecondary, fontSize: 12 };
const gridStyle  = { stroke: colors.border, strokeDasharray: '3 3' };
const tooltipCss = {
  contentStyle: { borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 },
};
const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 48 };
const CHART_HEIGHT = 320;

// ─── Value formatters ─────────────────────────────────────────────────────────
const formatFull = (val, isCurrency) =>
  isCurrency
    ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : Number(val).toLocaleString();

const formatYAxis = (val, isCurrency) =>
  isCurrency ? `$${(val / 1000).toFixed(0)}k` : `${val}`;

// ─── Donut percentage label ───────────────────────────────────────────────────
const renderDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── DynamicChart ─────────────────────────────────────────────────────────────
// Accepts:
//   chartType  — 'line' | 'bar' | 'donut'
//   data       — [{name: string, value: number}, ...]
//   isCurrency — boolean — formats values as $ amounts
//
// All Recharts config lives here; the parent component passes only typed props.
const DynamicChart = ({ chartType, data, isCurrency }) => {
  if (!data || data.length === 0) {
    return (
      <Empty
        description={
          <Text type="secondary">
            No data found for the selected configuration. Try adjusting filters or date range.
          </Text>
        }
        style={{ padding: '56px 0' }}
      />
    );
  }

  const tooltipFormatter = (val) => [formatFull(val, isCurrency), 'Value'];
  const yAxisFormatter   = (val) => formatYAxis(val, isCurrency);

  // ── Line Chart ─────────────────────────────────────────────────────────────
  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="name"
            tick={axisStyle}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tick={{ ...axisStyle, fontSize: 11 }} tickFormatter={yAxisFormatter} />
          <Tooltip {...tooltipCss} formatter={tooltipFormatter} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.primary}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.primary, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ── Bar Chart ──────────────────────────────────────────────────────────────
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis
            dataKey="name"
            tick={axisStyle}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tick={{ ...axisStyle, fontSize: 11 }} tickFormatter={yAxisFormatter} />
          <Tooltip {...tooltipCss} formatter={tooltipFormatter} />
          <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ── Donut Chart ────────────────────────────────────────────────────────────
  if (chartType === 'donut') {
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={72}
            outerRadius={114}
            dataKey="value"
            labelLine={false}
            label={renderDonutLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipCss}
            formatter={(val, name) => [formatFull(val, isCurrency), name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <Text style={{ fontSize: 13 }}>{value}</Text>}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default DynamicChart;
