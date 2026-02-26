import React from 'react';
import { Row, Col, Typography, Divider, Card, Button, Space } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  FileTextOutlined,
  UploadOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ── Selectors ─────────────────────────────────────────────────────────────────
import {
  selectDashboardMetrics,
  selectMemberGrowthData,
  selectMemberStatusData,
  selectRevenueTrendData,
  selectRenewalData,
} from '../features/dashboard/dashboardSelectors';
import { selectIsNewGym } from '../selectors/gymSelectors';

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

// ─── Welcome card — shown when the gym has no plans and no members ─────────────
const WelcomeCard = ({ navigate }) => (
  <div style={{ maxWidth: 720, margin: '40px auto' }}>
    <Card style={{ textAlign: 'center', marginBottom: 24, borderTop: `4px solid ${colors.primary}` }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Text strong style={{ color: '#fff', fontSize: 22 }}>G</Text>
      </div>
      <Title level={4} style={{ margin: 0 }}>Welcome to GymPro!</Title>
      <Text type="secondary">
        Your gym is all set up. Complete these 3 steps to start tracking members and revenue.
      </Text>
    </Card>

    <Row gutter={[16, 16]}>
      {/* Step 1 */}
      <Col xs={24} md={8}>
        <Card
          style={{ textAlign: 'center', borderTop: `3px solid ${colors.primary}`, height: '100%' }}
          styles={{ body: { padding: '24px 20px' } }}
        >
          <FileTextOutlined
            style={{ fontSize: 36, color: colors.primary, display: 'block', marginBottom: 12 }}
          />
          <Title level={5} style={{ margin: '0 0 6px' }}>1. Create Plans</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13 }}>
            Define membership tiers with pricing and duration.
          </Text>
          <Button type="primary" block onClick={() => navigate('/plans')}>
            Create Plans
          </Button>
        </Card>
      </Col>

      {/* Step 2 */}
      <Col xs={24} md={8}>
        <Card
          style={{ textAlign: 'center', borderTop: `3px solid ${colors.success}`, height: '100%' }}
          styles={{ body: { padding: '24px 20px' } }}
        >
          <TeamOutlined
            style={{ fontSize: 36, color: colors.success, display: 'block', marginBottom: 12 }}
          />
          <Title level={5} style={{ margin: '0 0 6px' }}>2. Add Members</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13 }}>
            Import a CSV list or add members one by one.
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" ghost block icon={<UploadOutlined />} onClick={() => navigate('/upload')}>
              Import CSV
            </Button>
            <Button block onClick={() => navigate('/members')}>
              Add Manually
            </Button>
          </Space>
        </Card>
      </Col>

      {/* Step 3 */}
      <Col xs={24} md={8}>
        <Card
          style={{ textAlign: 'center', borderTop: `3px solid ${colors.info}`, height: '100%' }}
          styles={{ body: { padding: '24px 20px' } }}
        >
          <CreditCardOutlined
            style={{ fontSize: 36, color: colors.info, display: 'block', marginBottom: 12 }}
          />
          <Title level={5} style={{ margin: '0 0 6px' }}>3. Record Payments</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13 }}>
            Log member payments to start tracking revenue.
          </Text>
          <Button block onClick={() => navigate('/payments')}>
            Go to Payments
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const isNewGym = useSelector(selectIsNewGym);

  const metrics          = useSelector(selectDashboardMetrics);
  const memberGrowthData = useSelector(selectMemberGrowthData);
  const memberStatusData = useSelector(selectMemberStatusData);
  const revenueTrendData = useSelector(selectRevenueTrendData);
  const renewalData      = useSelector(selectRenewalData);

  // ── Operational Summary card definitions ──────────────────────────────────
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

      {/* ── New gym welcome flow ───────────────────────────────────────────── */}
      {isNewGym ? (
        <WelcomeCard navigate={navigate} />
      ) : (
        <>
          {/* Global Filters — drives all three sections below */}
          <GlobalFilters />

          {/* ── 1. Operational Summary ──────────────────────────────────────── */}
          <SectionDivider label="Operational Summary" />

          <Row gutter={ROW_GUTTER}>
            {operationalCards.map((card) => (
              <Col key={card.title} xs={12} sm={8} md={8} lg={4}>
                <MetricCard {...card} />
              </Col>
            ))}
          </Row>

          {/* ── 2. Performance Overview ─────────────────────────────────────── */}
          <div style={SECTION_GAP}>
            <SectionDivider label="Performance Overview" />
            <PerformanceOverview />
          </div>

          {/* ── 3. Analytics ────────────────────────────────────────────────── */}
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
