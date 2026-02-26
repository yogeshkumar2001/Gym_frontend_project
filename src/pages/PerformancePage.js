import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Divider, Space, Tag, Spin } from 'antd';
import {
  LineChartOutlined,
  RiseOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

// ── Thunks ────────────────────────────────────────────────────────────────────
import { fetchMembersThunk }  from '../features/members/membersSlice';
import { fetchPaymentsThunk } from '../features/payments/paymentsSlice';
import { fetchPlansThunk }    from '../features/plans/plansSlice';

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
import EmptyState           from '../components/common/EmptyState';
import { colors }           from '../theme/theme';

const { Title, Text } = Typography;

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_GUTTER = [16, 16];
const SECTION_GAP = { marginTop: 40 };
const CHART_GAP   = { marginTop: 16 };

// ─── Section divider ──────────────────────────────────────────────────────────
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
const COMPARATIVE_KPIS = [
  { key: 'revenueMoM',   title: 'Revenue MoM',   tooltip: 'Paid revenue this period vs. the equivalent prior period.' },
  { key: 'revenueYoY',   title: 'Revenue YoY',   tooltip: 'Paid revenue vs. the same window one year ago.' },
  { key: 'memberGrowth', title: 'Member Growth',  tooltip: 'New members joined this period vs. the prior period.' },
  { key: 'churnRate',    title: 'Churn Rate',     tooltip: 'Members whose plan expired ÷ members at period start. Lower is better.' },
  { key: 'renewalRate',  title: 'Renewal Rate',   tooltip: 'Expiring members who made a paid renewal this period. Higher is better.' },
];

// ─── PerformancePage ──────────────────────────────────────────────────────────
const PerformancePage = () => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(fetchMembersThunk()),
      dispatch(fetchPaymentsThunk()),
      dispatch(fetchPlansThunk()),
    ]).finally(() => setReady(true));
  }, [dispatch]);

  const membersLoading  = useSelector((s) => s.members.loading);
  const paymentsLoading = useSelector((s) => s.payments.loading);
  const isLoading = !ready || membersLoading || paymentsLoading;

  // Raw lists for derived conditions
  const members  = useSelector((s) => s.members.list);
  const payments = useSelector((s) => s.payments.list);

  const hasMembers  = members.length > 0;
  const hasPayments = payments.length > 0;

  // ── Selector calls (always safe to call) ────────────────────────────────────
  const metrics          = useSelector(selectDashboardMetrics);
  const metaKPIs         = useSelector(selectMetaKPIs);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const renewalData      = useSelector(selectRenewalData);

  // Period badge
  const { startDate, endDate } = useSelector((state) => state.filters);
  const periodLabel = startDate && endDate
    ? `${dayjs(startDate).format('MMM D')} – ${dayjs(endDate).format('MMM D, YYYY')}`
    : dayjs().format('MMMM YYYY');

  // ── Snapshot cards ──────────────────────────────────────────────────────────
  const snapshotCards = [
    { title: 'Revenue',         value: metrics.revenue,          icon: <RiseOutlined style={{ fontSize: 22, color: colors.info }} />,      color: colors.info,      prefix: '$', precision: 2, hint: 'Paid revenue — current period' },
    { title: 'New Members',     value: metaKPIs.memberGrowth.value, icon: <TeamOutlined style={{ fontSize: 22, color: colors.primary }} />,  color: colors.primary,   hint: 'Joined in current period' },
    { title: 'Active Members',  value: metrics.activeMembers,    icon: <CheckCircleOutlined style={{ fontSize: 22, color: colors.success }} />, color: colors.success, hint: 'Plans currently valid' },
    { title: 'Pending Amount',  value: metrics.pendingAmount,    icon: <DollarOutlined style={{ fontSize: 22, color: colors.warning }} />,   color: colors.warning,   prefix: '$', precision: 2, hint: 'Partial + due payments' },
    { title: 'Renewals (7d)',   value: metrics.upcomingRenewals, icon: <ClockCircleOutlined style={{ fontSize: 22, color: colors.secondary }} />, color: colors.secondary, hint: 'Active members expiring soon' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space align="center" size={12}>
            <LineChartOutlined style={{ fontSize: 24, color: colors.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Performance Overview</Title>
              <Text type="secondary">Strategic insights across revenue, membership, and retention.</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Tag
            color="geekblue"
            style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}
          >
            {periodLabel}
          </Tag>
        </Col>
      </Row>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {/* No payments at all */}
      {!isLoading && !hasPayments && !hasMembers && (
        <EmptyState
          icon={<CreditCardOutlined />}
          title="No performance data yet"
          description="Performance metrics appear after you start recording payments."
          primaryActionLabel="Go to Payments"
          primaryActionLink="/payments"
        />
      )}

      {/* Members exist but no payments */}
      {!isLoading && hasMembers && !hasPayments && (
        <EmptyState
          icon={<CreditCardOutlined />}
          title="You have members, but no revenue recorded yet."
          description="Record your first payment to unlock performance metrics, revenue trends, and retention analytics."
          primaryActionLabel="Go to Payments"
          primaryActionLink="/payments"
        />
      )}

      {/* Full performance view */}
      {!isLoading && hasPayments && (
        <>
          <GlobalFilters />

          {/* Section 1: Period Snapshot */}
          <SectionDivider label="Period Snapshot" />
          <Row gutter={ROW_GUTTER}>
            {snapshotCards.map((card) => (
              <Col key={card.title} xs={12} sm={8} md={8} lg={4}>
                <MetricCard {...card} />
              </Col>
            ))}
          </Row>

          {/* Section 2: Comparative Performance */}
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

          {/* Section 3: Trends */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Trends" />
            <Row gutter={ROW_GUTTER}>
              <Col xs={24} lg={12}><RevenueTrendChart data={revenueTrendData} /></Col>
              <Col xs={24} lg={12}><JoiningTrendChart data={memberGrowthData} /></Col>
            </Row>
            <Row gutter={ROW_GUTTER} style={CHART_GAP}>
              <Col xs={24}><RenewalForecastChart data={renewalData} /></Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformancePage;
