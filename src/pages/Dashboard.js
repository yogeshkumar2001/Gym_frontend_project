import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

// ── Selectors ─────────────────────────────────────────────────────────────────
import {
  selectDashboardMetrics,
  selectMemberGrowthData,
  selectMemberStatusData,
  selectRevenueTrendData,
  selectRenewalData,
} from '../features/dashboard/dashboardSelectors';

// ── Components ────────────────────────────────────────────────────────────────
import GlobalFilters        from '../components/filters/GlobalFilters';
import MetricCard           from '../components/dashboard/MetricCard';
import PerformanceOverview  from '../components/dashboard/PerformanceOverview';
import RevenueTrendChart    from '../components/dashboard/charts/RevenueTrendChart';
import JoiningTrendChart    from '../components/dashboard/charts/JoiningTrendChart';
import MemberStatusChart    from '../components/dashboard/charts/MemberStatusChart';
import RenewalForecastChart from '../components/dashboard/charts/RenewalForecastChart';

import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_GUTTER   = [16, 16];
const CHART_GAP    = { marginTop: 16 };
const SECTION_GAP  = { marginTop: 40 };

// ─── Section divider ──────────────────────────────────────────────────────────
// Consistent label treatment across all three dashboard sections.
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Three clearly separated sections:
//   1. Operational Summary  — 5 live KPI cards (current-period snapshots)
//   2. Performance Overview — 4 comparative KPIs with trend indicators
//   3. Analytics            — 4 charts in a balanced 2×2 grid
//
// No calculations or filtering logic lives here — all data comes from selectors.
const Dashboard = () => {
  const metrics        = useSelector(selectDashboardMetrics);
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const memberStatusData = useSelector(selectMemberStatusData);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const renewalData      = useSelector(selectRenewalData);

  // ── Operational Summary card definitions ──────────────────────────────────
  // Exactly 5 cards — one per business concern.
  // "Expiring Soon" uses the built-in 7-day window from selectDashboardMetrics.
  const operationalCards = [
    {
      title:  'Total Members',
      value:  metrics.totalMembers,
      icon:   <TeamOutlined style={{ fontSize: 22, color: colors.primary }} />,
      color:  colors.primary,
      hint:   'Filtered by join date + plan',
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
      title:  'Expiring Soon',
      value:  metrics.upcomingRenewals,
      icon:   <ClockCircleOutlined style={{ fontSize: 22, color: colors.secondary }} />,
      color:  colors.secondary,
      hint:   'Active members in 7-day window',
    },
    {
      title:     'Revenue (Period)',
      value:     metrics.revenue,
      icon:      <RiseOutlined style={{ fontSize: 22, color: colors.info }} />,
      color:     colors.info,
      prefix:    '$',
      precision: 2,
      hint:      'Paid revenue — date range or current month',
    },
  ];

  return (
    <div>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <Title level={3} style={{ marginBottom: 20 }}>
        Dashboard
      </Title>

      {/* Global Filters — drives all three sections below */}
      <GlobalFilters />

      {/* ── 1. Operational Summary ────────────────────────────────────────── */}
      {/* Five live snapshot cards. No comparisons — current state only.      */}
      <SectionDivider label="Operational Summary" />

      <Row gutter={ROW_GUTTER}>
        {operationalCards.map((card) => (
          <Col key={card.title} xs={12} sm={8} md={8} lg={4}>
            <MetricCard {...card} />
          </Col>
        ))}
      </Row>

      {/* ── 2. Performance Overview ───────────────────────────────────────── */}
      {/* Four comparative KPIs: MoM, YoY, member growth, churn.             */}
      {/* Each card shows primary value + trend direction vs. prior period.   */}
      <div style={SECTION_GAP}>
        <SectionDivider label="Performance Overview" />
        <PerformanceOverview />
      </div>

      {/* ── 3. Analytics ─────────────────────────────────────────────────── */}
      {/* Four charts in a balanced 2 × 2 grid.                              */}
      {/* Row 1: Revenue trend + Member joining trend                         */}
      {/* Row 2: Member status breakdown + Upcoming renewal forecast          */}
      <div style={SECTION_GAP}>
        <SectionDivider label="Analytics" />

        <Row gutter={ROW_GUTTER}>
          <Col xs={24} lg={12}>
            <RevenueTrendChart data={revenueTrendData} />
          </Col>
          <Col xs={24} lg={12}>
            <JoiningTrendChart data={memberGrowthData} />
          </Col>
        </Row>

        <Row gutter={ROW_GUTTER} style={CHART_GAP}>
          <Col xs={24} lg={12}>
            <MemberStatusChart data={memberStatusData} />
          </Col>
          <Col xs={24} lg={12}>
            <RenewalForecastChart data={renewalData} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
