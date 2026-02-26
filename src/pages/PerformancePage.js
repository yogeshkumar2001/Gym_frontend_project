import React from 'react';
import { Row, Col, Typography, Divider, Space, Tag, Card } from 'antd';
import {
  LineChartOutlined,
  RiseOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// ── Selectors ──────────────────────────────────────────────────────────────────
import {
  selectDashboardMetrics,
  selectRevenueTrendData,
  selectMemberGrowthData,
  selectRenewalData,
} from '../features/dashboard/dashboardSelectors';
import { selectMetaKPIs } from '../features/dashboard/metaSelectors';

// ── Reusable components ────────────────────────────────────────────────────────
import GlobalFilters        from '../components/filters/GlobalFilters';
import MetricCard           from '../components/dashboard/MetricCard';
import { MetaKPICard }      from '../components/dashboard/ExecutiveSummary';
import RevenueTrendChart    from '../components/dashboard/charts/RevenueTrendChart';
import JoiningTrendChart    from '../components/dashboard/charts/JoiningTrendChart';
import RenewalForecastChart from '../components/dashboard/charts/RenewalForecastChart';
import { colors }           from '../theme/theme';

const { Title, Text } = Typography;

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_GUTTER = [16, 16];
const SECTION_GAP = { marginTop: 40 };
const CHART_GAP   = { marginTop: 16 };

// ─── Section divider ──────────────────────────────────────────────────────────
// Uppercase label consistent with the refactored Dashboard style.
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={{ margin: '0 0 20px' }}>
    <Text
      style={{
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: colors.textSecondary,
      }}
    >
      {label}
    </Text>
  </Divider>
);

// ─── Comparative KPI definitions ──────────────────────────────────────────────
// All five meta KPIs exposed on this page (vs four on the dashboard widget).
// Key maps directly to selectMetaKPIs return object.
const COMPARATIVE_KPIS = [
  {
    key:     'revenueMoM',
    title:   'Revenue MoM',
    tooltip: 'Paid revenue this period vs. the equivalent prior period.',
  },
  {
    key:     'revenueYoY',
    title:   'Revenue YoY',
    tooltip: 'Paid revenue vs. the same window one year ago.',
  },
  {
    key:     'memberGrowth',
    title:   'Member Growth',
    tooltip: 'New members joined this period vs. the prior period.',
  },
  {
    key:     'churnRate',
    title:   'Churn Rate',
    tooltip: 'Members whose plan expired ÷ members at period start. Lower is better.',
  },
  {
    key:     'renewalRate',
    title:   'Renewal Rate',
    tooltip: 'Expiring members who made a paid renewal this period. Higher is better.',
  },
];

// ─── PerformancePage ──────────────────────────────────────────────────────────
// Three clearly separated sections:
//
//   1. Period Snapshot   — 5 non-comparative KPI cards (current-state only)
//   2. Comparative KPIs  — 5 trend cards with % change vs. prior period
//   3. Trends            — Revenue + Member Growth side-by-side,
//                          Renewal Forecast full-width below
//
// All data flows from memoized selectors. Zero calculations inside this component.
const PerformancePage = () => {
  // ── Selector calls ──────────────────────────────────────────────────────────
  const metrics          = useSelector(selectDashboardMetrics);
  const metaKPIs         = useSelector(selectMetaKPIs);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const renewalData      = useSelector(selectRenewalData);

  const membersEmpty = useSelector((s) => s.members.list.length === 0);
  const paymentsEmpty = useSelector((s) => s.payments.list.length === 0);
  const hasNoData = membersEmpty && paymentsEmpty;

  // Period badge — surfaces the active date range for user context
  const { startDate, endDate } = useSelector((state) => state.filters);
  const periodLabel = startDate && endDate
    ? `${dayjs(startDate).format('MMM D')} – ${dayjs(endDate).format('MMM D, YYYY')}`
    : dayjs().format('MMMM YYYY');

  // ── Period Snapshot card definitions ────────────────────────────────────────
  // Non-comparative — show the value for the current period only.
  // "New Members" pulls from metaKPIs.memberGrowth.value (= newMembersCurrent)
  // which respects the date window consistently with the comparative section.
  const snapshotCards = [
    {
      title:     'Revenue',
      value:     metrics.revenue,
      icon:      <RiseOutlined style={{ fontSize: 22, color: colors.info }} />,
      color:     colors.info,
      prefix:    '$',
      precision: 2,
      hint:      'Paid revenue — current period',
    },
    {
      title:  'New Members',
      value:  metaKPIs.memberGrowth.value,
      icon:   <TeamOutlined style={{ fontSize: 22, color: colors.primary }} />,
      color:  colors.primary,
      hint:   'Joined in current period',
    },
    {
      title:  'Active Members',
      value:  metrics.activeMembers,
      icon:   <CheckCircleOutlined style={{ fontSize: 22, color: colors.success }} />,
      color:  colors.success,
      hint:   'Plans currently valid',
    },
    {
      title:     'Pending Amount',
      value:     metrics.pendingAmount,
      icon:      <DollarOutlined style={{ fontSize: 22, color: colors.warning }} />,
      color:     colors.warning,
      prefix:    '$',
      precision: 2,
      hint:      'Partial + due payments',
    },
    {
      title:  'Renewals (7 days)',
      value:  metrics.upcomingRenewals,
      icon:   <ClockCircleOutlined style={{ fontSize: 22, color: colors.secondary }} />,
      color:  colors.secondary,
      hint:   'Active members expiring soon',
    },
  ];

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space align="center" size={12}>
            <LineChartOutlined style={{ fontSize: 24, color: colors.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Performance Overview</Title>
              <Text type="secondary">
                Strategic insights across revenue, membership, and retention.
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          {/* Active period badge — updates whenever the date filter changes */}
          <Tag
            color="geekblue"
            style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}
          >
            {periodLabel}
          </Tag>
        </Col>
      </Row>

      {/* Global Filters — drives all three sections */}
      <GlobalFilters />

      {/* ── No-data empty state ─────────────────────────────────────────────── */}
      {hasNoData ? (
        <Card style={{ textAlign: 'center', padding: '56px 24px', marginTop: 8 }}>
          <BarChartOutlined
            style={{
              fontSize: 48,
              color: '#d9d9d9',
              display: 'block',
              marginBottom: 16,
            }}
          />
          <div style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 16 }}>No data to display yet</strong>
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 14 }}>
            Performance analytics will appear once your gym has members and payment records.
          </div>
        </Card>
      ) : (
        <>
          {/* ── Section 1: Period Snapshot ──────────────────────────────────── */}
          <SectionDivider label="Period Snapshot" />

          <Row gutter={ROW_GUTTER}>
            {snapshotCards.map((card) => (
              <Col key={card.title} xs={12} sm={8} md={8} lg={4}>
                <MetricCard {...card} />
              </Col>
            ))}
          </Row>

          {/* ── Section 2: Comparative Performance ─────────────────────────── */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Comparative Performance" />

            <Row gutter={ROW_GUTTER}>
              {COMPARATIVE_KPIS.map(({ key, title, tooltip }) => (
                <Col key={key} xs={24} sm={12} md={8} lg={4}>
                  <MetaKPICard title={title} kpi={metaKPIs[key]} tooltip={tooltip} />
                </Col>
              ))}
            </Row>
          </div>

          {/* ── Section 3: Trends ───────────────────────────────────────────── */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Trends" />

            <Row gutter={ROW_GUTTER}>
              <Col xs={24} lg={12}>
                <RevenueTrendChart data={revenueTrendData} />
              </Col>
              <Col xs={24} lg={12}>
                <JoiningTrendChart data={memberGrowthData} />
              </Col>
            </Row>

            <Row gutter={ROW_GUTTER} style={CHART_GAP}>
              <Col xs={24}>
                <RenewalForecastChart data={renewalData} />
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformancePage;
