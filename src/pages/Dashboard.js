import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Divider, Spin } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ── Thunks ────────────────────────────────────────────────────────────────────
import { fetchMembersThunk } from '../features/members/membersSlice';
import { fetchPlansThunk }   from '../features/plans/plansSlice';
import { fetchPaymentsThunk } from '../features/payments/paymentsSlice';

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
import EmptyState           from '../components/common/EmptyState';

import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_GUTTER  = [16, 16];
const CHART_GAP   = { marginTop: 16 };
const SECTION_GAP = { marginTop: 40 };

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

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Track when all initial fetches have settled
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(fetchMembersThunk()),
      dispatch(fetchPlansThunk()),
      dispatch(fetchPaymentsThunk()),
    ]).finally(() => setReady(true));
  }, [dispatch]);

  // Per-slice loading flags
  const membersLoading  = useSelector((s) => s.members.loading);
  const plansLoading    = useSelector((s) => s.plans.loading);
  const paymentsLoading = useSelector((s) => s.payments.loading);
  const isLoading = !ready || membersLoading || plansLoading || paymentsLoading;

  // Raw lists — used for derived conditions
  const members  = useSelector((s) => s.members.list);
  const plans    = useSelector((s) => s.plans.list);
  const payments = useSelector((s) => s.payments.list);

  // Analytics selectors — safe to call always; return empty arrays when lists are empty
  const metrics          = useSelector(selectDashboardMetrics);
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const memberStatusData = useSelector(selectMemberStatusData);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const renewalData      = useSelector(selectRenewalData);

  // ── Derived conditions ────────────────────────────────────────────────────
  const hasPlans    = plans.length > 0;
  const hasMembers  = members.length > 0;
  const hasPayments = payments.length > 0;

  // Case 1 — pristine gym: no plans and no members
  const isNewGym    = !hasPlans && !hasMembers;
  // Case 2 — plans exist but no members enrolled yet
  const isNoMembers = hasPlans && !hasMembers;
  // Case 3 — members added but no payments recorded yet
  const isNoPayments = hasMembers && !hasPayments;

  // ── KPI cards ─────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>Dashboard</Title>

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {/* ── Case 1: no plans + no members ─────────────────────────────────── */}
      {!isLoading && isNewGym && (
        <EmptyState
          icon={<ShopOutlined />}
          title="Welcome! Let's set up your gym."
          description="You need plans and members before analytics can appear."
          primaryActionLabel="Create Plan"
          primaryActionLink="/plans"
          secondaryActionLabel="Import Members"
          secondaryActionLink="/upload"
        />
      )}

      {/* ── Case 2: plans exist, no members ───────────────────────────────── */}
      {!isLoading && isNoMembers && (
        <EmptyState
          icon={<TeamOutlined />}
          title="Your plans are ready. Add members to start tracking revenue."
          description="Create member profiles to begin managing memberships and payments."
          primaryActionLabel="Add Member"
          primaryActionLink="/members"
          secondaryActionLabel="Import CSV"
          secondaryActionLink="/upload"
        />
      )}

      {/* ── Case 3: members exist, no payments ────────────────────────────── */}
      {!isLoading && isNoPayments && (
        <EmptyState
          icon={<DollarOutlined />}
          title="Members added. Start recording payments to unlock analytics."
          description="Revenue metrics, charts, and growth trends will appear after your first payment is recorded."
          primaryActionLabel="Go to Payments"
          primaryActionLink="/payments"
        />
      )}

      {/* ── Full dashboard — members + payments exist ──────────────────────── */}
      {!isLoading && hasMembers && hasPayments && (
        <>
          <GlobalFilters />

          {/* 1. Operational Summary */}
          <SectionDivider label="Operational Summary" />
          <Row gutter={ROW_GUTTER}>
            {operationalCards.map((card) => (
              <Col key={card.title} xs={12} sm={8} md={8} lg={4}>
                <MetricCard {...card} />
              </Col>
            ))}
          </Row>

          {/* 2. Performance Overview */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Performance Overview" />
            <PerformanceOverview />
          </div>

          {/* 3. Analytics charts */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Analytics" />
            <Row gutter={ROW_GUTTER}>
              <Col xs={24} lg={12}><RevenueTrendChart data={revenueTrendData} /></Col>
              <Col xs={24} lg={12}><JoiningTrendChart data={memberGrowthData} /></Col>
            </Row>
            <Row gutter={ROW_GUTTER} style={CHART_GAP}>
              <Col xs={24} lg={12}><MemberStatusChart data={memberStatusData} /></Col>
              <Col xs={24} lg={12}><RenewalForecastChart data={renewalData} /></Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
