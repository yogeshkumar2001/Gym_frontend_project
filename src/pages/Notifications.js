import React from 'react';
import { Row, Col, Typography, message, Statistic, Card, Space } from 'antd';
import {
  BellOutlined, ClockCircleOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

// ── Selectors ─────────────────────────────────────────────────────────────────
import { selectReminderCandidates } from '../features/notifications/notificationSelectors';

// ── Components ────────────────────────────────────────────────────────────────
import GlobalFilters           from '../components/filters/GlobalFilters';
import NotificationSettings    from '../components/notifications/NotificationSettings';
import ExpiryReminderTable     from '../components/notifications/ExpiryReminderTable';
import PaymentReminderTable    from '../components/notifications/PaymentReminderTable';
import { colors }              from '../theme/theme';

const { Title, Text } = Typography;

// ─── Notifications page ───────────────────────────────────────────────────────
const Notifications = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const candidates = useSelector(selectReminderCandidates);

  return (
    <div>
      {contextHolder}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space align="center">
            <BellOutlined style={{ fontSize: 22, color: colors.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Notifications</Title>
              <Text type="secondary">
                Monitor expiring memberships and overdue payments — send reminders with one click.
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* ── Quick summary ────────────────────────────────────────────────────── */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8}>
          <Card styles={{ body: { padding: '16px 20px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Expiring Soon"
              value={candidates.expiringCount}
              prefix={<ClockCircleOutlined style={{ color: colors.warning }} />}
              valueStyle={{ color: colors.warning }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card styles={{ body: { padding: '16px 20px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Overdue Payments"
              value={candidates.overdueCount}
              prefix={<DollarOutlined style={{ color: colors.error }} />}
              valueStyle={{ color: candidates.overdueCount > 0 ? colors.error : colors.success }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card styles={{ body: { padding: '16px 20px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Total Alerts"
              value={candidates.total}
              prefix={<BellOutlined style={{ color: colors.primary }} />}
              valueStyle={{ color: candidates.total > 0 ? colors.primary : colors.success }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Settings card ───────────────────────────────────────────────────── */}
      <NotificationSettings />

      {/* ── Global filters ──────────────────────────────────────────────────── */}
      <GlobalFilters searchPlaceholder="Search member name or phone…" />

      {/* ── Expiry Reminder table ────────────────────────────────────────────── */}
      <ExpiryReminderTable messageApi={messageApi} />

      {/* ── Payment Reminder table ───────────────────────────────────────────── */}
      <PaymentReminderTable messageApi={messageApi} />
    </div>
  );
};

export default Notifications;
