import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BellOutlined,
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
  selectFeeBreakdownData,
} from '../features/dashboard/dashboardSelectors';

// ── Components ────────────────────────────────────────────────────────────────
import GlobalFilters from '../components/filters/GlobalFilters';
import MetricCard from '../components/dashboard/MetricCard';
import JoiningTrendChart from '../components/dashboard/charts/JoiningTrendChart';
import MemberStatusChart from '../components/dashboard/charts/MemberStatusChart';
import RevenueTrendChart from '../components/dashboard/charts/RevenueTrendChart';
import RenewalForecastChart from '../components/dashboard/charts/RenewalForecastChart';
import FeeBreakdownChart from '../components/dashboard/charts/FeeBreakdownChart';

import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_GUTTER = [16, 16];
const SECTION_STYLE = { marginTop: 16 };
const DIVIDER_STYLE = { margin: '20px 0 16px' };

// ─── Dashboard ────────────────────────────────────────────────────────────────
// All values are derived from Redux state via memoized selectors.
// Nothing is hardcoded. All charts and cards react to GlobalFilters.
const Dashboard = () => {
  // ── Single selector call for all 6 KPIs ────────────────────────────────────
  const metrics = useSelector(selectDashboardMetrics);

  // ── Chart data — each selector is independent and memoized ─────────────────
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const memberStatusData = useSelector(selectMemberStatusData);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const renewalData = useSelector(selectRenewalData);
  const feeBreakdownData = useSelector(selectFeeBreakdownData);

  // ── Metric card definitions ─────────────────────────────────────────────────
  const metricCards = [
    {
      title: 'Total Members',
      value: metrics.totalMembers,
      icon: <TeamOutlined style={{ fontSize: 22, color: colors.primary }} />,
      color: colors.primary,
      hint: 'Filtered by join date + plan',
    },
    {
      title: 'Active Members',
      value: metrics.activeMembers,
      icon: <CheckCircleOutlined style={{ fontSize: 22, color: colors.success }} />,
      color: colors.success,
      hint: 'Plans currently valid',
    },
    {
      title: 'Expired Plans',
      value: metrics.expiredMembers,
      icon: <ClockCircleOutlined style={{ fontSize: 22, color: colors.error }} />,
      color: colors.error,
      hint: 'Lapsed in selected period',
    },
    {
      title: 'Pending Amount',
      value: metrics.pendingAmount,
      icon: <DollarOutlined style={{ fontSize: 22, color: colors.warning }} />,
      color: colors.warning,
      prefix: '$',
      precision: 2,
      hint: 'Partial + due payments',
    },
    {
      title: 'Renewals (7 days)',
      value: metrics.upcomingRenewals,
      icon: <BellOutlined style={{ fontSize: 22, color: colors.secondary }} />,
      color: colors.secondary,
      hint: 'Active members expiring soon',
    },
    {
      title: metrics.revenue !== undefined && (metrics.revenue > 0 || true)
        ? 'Revenue (Period)'
        : 'Revenue (Month)',
      value: metrics.revenue,
      icon: <RiseOutlined style={{ fontSize: 22, color: colors.info }} />,
      color: colors.info,
      prefix: '$',
      precision: 2,
      hint: 'Date range or current month',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <Title level={3} style={{ marginBottom: 16 }}>
        Dashboard
      </Title>

      {/* Global Filters — drives all cards and charts below */}
      <GlobalFilters />

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <Row gutter={ROW_GUTTER}>
        {metricCards.map((card) => (
          <Col xs={12} sm={8} lg={4} key={card.title}>
            <MetricCard {...card} />
          </Col>
        ))}
      </Row>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <Divider orientation="left" style={DIVIDER_STYLE}>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
          Analytics
        </Text>
      </Divider>

      {/* Row 1: Joining Trend (wide) + Member Status Donut (narrow) */}
      <Row gutter={ROW_GUTTER}>
        <Col xs={24} lg={16}>
          <JoiningTrendChart data={memberGrowthData} />
        </Col>
        <Col xs={24} lg={8}>
          <MemberStatusChart data={memberStatusData} />
        </Col>
      </Row>

      {/* Row 2: Revenue Trend + Renewal Forecast */}
      <Row gutter={ROW_GUTTER} style={SECTION_STYLE}>
        <Col xs={24} lg={12}>
          <RevenueTrendChart data={revenueTrendData} />
        </Col>
        <Col xs={24} lg={12}>
          <RenewalForecastChart data={renewalData} />
        </Col>
      </Row>

      {/* Row 3: Fee Breakdown — full width */}
      <Row gutter={ROW_GUTTER} style={SECTION_STYLE}>
        <Col xs={24}>
          <FeeBreakdownChart data={feeBreakdownData} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
