import React, { useCallback } from 'react';
import {
  Table, Tag, Button, Typography, Space, Tooltip, Card,
} from 'antd';
import {
  SendOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { markReminderSent } from '../../features/notifications/notificationsSlice';
import {
  selectExpiringMembers,
  selectSentReminders,
} from '../../features/notifications/notificationSelectors';
import { formatDate } from '../../utils/dateUtils';
import { PLAN_CONFIG } from '../../constants/memberConstants';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Days Remaining badge ──────────────────────────────────────────────────────
const DaysTag = ({ days }) => {
  if (days < 0)  return <Tag color="error"  icon={<ExclamationCircleOutlined />}>Expired</Tag>;
  if (days === 0) return <Tag color="error"  icon={<ClockCircleOutlined />}>Today</Tag>;
  if (days <= 2)  return <Tag color="error"  icon={<ClockCircleOutlined />}>{days}d left</Tag>;
  if (days <= 7)  return <Tag color="warning">{days}d left</Tag>;
  return              <Tag color="default">{days}d left</Tag>;
};

// ─── ExpiryReminderTable ──────────────────────────────────────────────────────
const ExpiryReminderTable = ({ messageApi }) => {
  const dispatch     = useDispatch();
  const members      = useSelector(selectExpiringMembers);
  const sentList     = useSelector(selectSentReminders);

  const isSent = useCallback(
    (memberId) => sentList.some((r) => r.memberId === memberId && r.type === 'expiry'),
    [sentList]
  );

  const handleSend = (member) => {
    dispatch(markReminderSent({ memberId: member.id, type: 'expiry' }));
    messageApi.success(`Expiry reminder sent to ${member.name}`);
  };

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Member Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (v) => <Text>{v || '—'}</Text>,
    },
    {
      title: 'Plan',
      dataIndex: 'planId',
      render: (planId) => {
        const cfg = PLAN_CONFIG[planId];
        return cfg ? (
          <Tag color={cfg.color}>{cfg.name}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
      render: (v) => <Text>{formatDate(v)}</Text>,
    },
    {
      title: 'Days Remaining',
      dataIndex: 'daysRemaining',
      sorter: (a, b) => a.daysRemaining - b.daysRemaining,
      render: (days) => <DaysTag days={days} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const map = {
          active:   { color: 'success', label: 'Active'   },
          expired:  { color: 'error',   label: 'Expired'  },
          inactive: { color: 'default', label: 'Inactive' },
        };
        const cfg = map[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => {
        const sent = isSent(record.id);
        return sent ? (
          <Button
            size="small"
            icon={<CheckCircleOutlined />}
            style={{ color: colors.success, borderColor: colors.success }}
            disabled
          >
            Reminder Sent
          </Button>
        ) : (
          <Tooltip title="Simulate sending an expiry reminder via SMS/WhatsApp">
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSend(record)}
              style={{ background: colors.warning, borderColor: colors.warning }}
            >
              Send Reminder
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined style={{ color: colors.warning }} />
          <span>Expiry Reminders</span>
          <Tag color="orange">{members.length} member{members.length !== 1 ? 's' : ''}</Tag>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 24 }}
      styles={{ body: { padding: 0 } }}
    >
      <Table
        dataSource={members}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 760 }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: colors.success, marginBottom: 8, display: 'block' }} />
              <Text type="secondary">No members expiring in the current reminder window.</Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default ExpiryReminderTable;
