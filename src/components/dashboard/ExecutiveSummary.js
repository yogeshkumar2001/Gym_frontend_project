import React from 'react';
import { Row, Col, Card, Typography, Tag, Space, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { selectMetaKPIs } from '../../features/dashboard/metaSelectors';
import { colors } from '../../theme/theme';

const { Text, Title } = Typography;

// ─── Value formatters ─────────────────────────────────────────────────────────
const formatPrimary = (kpi) => {
  if (kpi.isCurrency) {
    return `$${kpi.value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (kpi.isPercent) return `${kpi.value}%`;
  return kpi.value.toLocaleString();
};

const formatChange = (kpi) => {
  const sign   = kpi.change > 0 ? '+' : '';
  const suffix = kpi.isPpChange ? 'pp' : '%';
  return `${sign}${kpi.change}${suffix}`;
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
// Pure presentational — receives all computed values as props.
// Color logic: isGood = positive for the business (not just numeric direction).
//   Revenue ↑ = isGood. Churn ↓ = isGood. Renewal ↑ = isGood.
export const MetaKPICard = ({ title, kpi, tooltip }) => {
  if (!kpi) return null;

  const isNeutral = kpi.change === 0;

  // Color reflects business outcome, not raw direction
  const tagColor = isNeutral
    ? undefined
    : kpi.isGood
    ? colors.success
    : colors.error;

  const arrowIcon = kpi.trend === 'up'
    ? <ArrowUpOutlined />
    : kpi.trend === 'down'
    ? <ArrowDownOutlined />
    : <MinusOutlined />;

  return (
    <Card
      hoverable
      size="small"
      style={{ height: '100%' }}
      styles={{ body: { padding: '16px' } }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <Space size={4} align="center" style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: colors.textSecondary,
          }}
        >
          {title}
        </Text>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleOutlined
              style={{ fontSize: 11, color: colors.textSecondary, cursor: 'help' }}
            />
          </Tooltip>
        )}
      </Space>

      {/* ── Primary value ─────────────────────────────────────────────────── */}
      {kpi.isAvailable ? (
        <>
          <Title
            level={4}
            style={{ margin: '0 0 8px', fontWeight: 700, lineHeight: 1.2 }}
          >
            {formatPrimary(kpi)}
          </Title>

          {/* ── Trend badge ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 4 }}>
            <Tag
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 12,
                color: isNeutral ? colors.textSecondary : tagColor,
                background: isNeutral
                  ? `${colors.textSecondary}18`
                  : `${tagColor}18`,
                border: `1px solid ${isNeutral ? colors.border : `${tagColor}40`}`,
              }}
            >
              {arrowIcon} {formatChange(kpi)}
            </Tag>
          </div>

          {/* ── Comparison context ───────────────────────────────────────── */}
          <Text type="secondary" style={{ fontSize: 11 }}>
            {kpi.comparisonLabel}
          </Text>

          {/* ── Sub-line (previous value or detail count) ─────────────────── */}
          {kpi.subline && (
            <div style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {kpi.subline}
              </Text>
            </div>
          )}
        </>
      ) : (
        /* N/A state — not enough data for this period */
        <>
          <Title
            level={4}
            style={{ margin: '0 0 6px', color: colors.textSecondary, fontWeight: 500 }}
          >
            N/A
          </Title>
          <Text type="secondary" style={{ fontSize: 11 }}>
            No data for this period
          </Text>
        </>
      )}
    </Card>
  );
};

// ─── KPI card definitions ─────────────────────────────────────────────────────
// title + tooltip stay constant; kpi data flows from the selector each render.
const KPI_DEFINITIONS = [
  {
    key:     'revenueMoM',
    title:   'Revenue MoM',
    tooltip: 'Paid revenue this period vs. the equivalent prior period.',
  },
  {
    key:     'revenueYoY',
    title:   'Revenue YoY',
    tooltip: 'Paid revenue this period vs. the same window one year ago.',
  },
  {
    key:     'memberGrowth',
    title:   'Member Growth',
    tooltip: 'New members joined this period vs. the prior period.',
  },
  {
    key:     'churnRate',
    title:   'Churn Rate',
    tooltip: 'Members whose plan expired this period ÷ members at period start. Lower is better.',
  },
  {
    key:     'renewalRate',
    title:   'Renewal Rate',
    tooltip: 'Expiring members who made a paid renewal payment this period. Higher is better.',
  },
];

// ─── ExecutiveSummary ────────────────────────────────────────────────────────
// Reads selectMetaKPIs once and renders the five executive KPI cards.
// All computation happens in the selector — this component is pure display.
const ExecutiveSummary = () => {
  const metaKPIs = useSelector(selectMetaKPIs);

  return (
    <Row gutter={[16, 16]}>
      {KPI_DEFINITIONS.map(({ key, title, tooltip }) => (
        <Col key={key} xs={24} sm={12} md={8} lg={4} xl={4}>
          <MetaKPICard
            title={title}
            kpi={metaKPIs[key]}
            tooltip={tooltip}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ExecutiveSummary;
