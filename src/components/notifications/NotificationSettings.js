import React from 'react';
import {
  Card, Row, Col, Switch, InputNumber, Typography, Space,
  Divider, Tag, Tooltip,
} from 'antd';
import {
  BellOutlined, ClockCircleOutlined, DollarOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAutoExpiryEnabled,
  setAutoPaymentEnabled,
  setReminderDays,
} from '../../features/notifications/notificationsSlice';
import { selectNotificationSettings } from '../../features/notifications/notificationSelectors';
import { colors } from '../../theme/theme';

const { Text, Title } = Typography;

// ─── Single setting row ───────────────────────────────────────────────────────
const SettingRow = ({ icon, label, description, children }) => (
  <Row align="middle" justify="space-between" style={{ padding: '14px 0' }}>
    <Col>
      <Space align="start">
        <span style={{ fontSize: 20, color: colors.primary }}>{icon}</span>
        <div>
          <Text strong>{label}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
        </div>
      </Space>
    </Col>
    <Col>{children}</Col>
  </Row>
);

// ─── NotificationSettings ─────────────────────────────────────────────────────
const NotificationSettings = () => {
  const dispatch  = useDispatch();
  const settings  = useSelector(selectNotificationSettings);

  return (
    <Card
      style={{ borderRadius: 12, marginBottom: 24 }}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
        <Col>
          <Space>
            <BellOutlined style={{ color: colors.primary, fontSize: 18 }} />
            <Title level={5} style={{ margin: 0 }}>Notification Settings</Title>
          </Space>
        </Col>
        <Col>
          <Tag color="blue">UI Simulation — no real SMS/Email sent</Tag>
        </Col>
      </Row>

      <Text type="secondary" style={{ fontSize: 13 }}>
        Configure auto-reminder behaviour. Toggles are stored in Redux and are
        backend-ready — wire to a scheduler in production.
      </Text>

      <Divider style={{ margin: '12px 0 4px' }} />

      {/* Expiry auto reminder */}
      <SettingRow
        icon={<ClockCircleOutlined />}
        label="Enable Expiry Auto Reminder"
        description="Automatically flag members expiring within the reminder window"
      >
        <Switch
          checked={settings.autoExpiryEnabled}
          onChange={(val) => dispatch(setAutoExpiryEnabled(val))}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </SettingRow>

      <Divider style={{ margin: '0' }} />

      {/* Payment due auto reminder */}
      <SettingRow
        icon={<DollarOutlined />}
        label="Enable Payment Due Reminder"
        description="Automatically flag members with overdue or pending payments"
      >
        <Switch
          checked={settings.autoPaymentEnabled}
          onChange={(val) => dispatch(setAutoPaymentEnabled(val))}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </SettingRow>

      <Divider style={{ margin: '0' }} />

      {/* Reminder days input */}
      <SettingRow
        icon={<BellOutlined />}
        label="Reminder Window (Days Before Expiry)"
        description="Members expiring within this many days will appear in the Expiry Reminders list"
      >
        <Space>
          <InputNumber
            min={1}
            max={60}
            value={settings.reminderDays}
            onChange={(val) => val && dispatch(setReminderDays(val))}
            style={{ width: 80 }}
            addonAfter="days"
          />
          <Tooltip title="Default: 3 days. Affects the Expiry Reminders table below.">
            <InfoCircleOutlined style={{ color: colors.textSecondary }} />
          </Tooltip>
        </Space>
      </SettingRow>
    </Card>
  );
};

export default NotificationSettings;
