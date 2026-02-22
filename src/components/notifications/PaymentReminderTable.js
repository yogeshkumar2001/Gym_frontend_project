import React, { useCallback } from 'react';
import {
  Table, Tag, Button, Typography, Space, Tooltip, Card,
} from 'antd';
import {
  SendOutlined, CheckCircleOutlined, DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { markReminderSent } from '../../features/notifications/notificationsSlice';
import {
  selectOverduePayments,
  selectSentReminders,
} from '../../features/notifications/notificationSelectors';
import { formatDate } from '../../utils/dateUtils';
import { colors } from '../../theme/theme';
import dayjs from 'dayjs';

const { Text } = Typography;

// ─── Overdue indicator ────────────────────────────────────────────────────────
const OverdueTag = ({ nextDueDate, status }) => {
  const diff = dayjs(nextDueDate).diff(dayjs(), 'day');
  if (status === 'due' && diff < 0) {
    return (
      <Tag color="error" icon={<ExclamationCircleOutlined />}>
        {Math.abs(diff)}d overdue
      </Tag>
    );
  }
  if (status === 'due')     return <Tag color="error">Due</Tag>;
  if (status === 'partial') return <Tag color="warning">Partial</Tag>;
  return <Tag>{status}</Tag>;
};

// ─── PaymentReminderTable ─────────────────────────────────────────────────────
const PaymentReminderTable = ({ messageApi }) => {
  const dispatch   = useDispatch();
  const payments   = useSelector(selectOverduePayments);
  const sentList   = useSelector(selectSentReminders);

  const isSent = useCallback(
    // Use payment memberId + 'payment' type as the key
    (memberId) => sentList.some((r) => r.memberId === memberId && r.type === 'payment'),
    [sentList]
  );

  const handleSend = (payment) => {
    dispatch(markReminderSent({ memberId: payment.memberId, type: 'payment' }));
    messageApi.success(`Payment reminder sent to ${payment.memberName}`);
  };

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Member Name',
      dataIndex: 'memberName',
      sorter: (a, b) => a.memberName.localeCompare(b.memberName),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Pending Amount',
      dataIndex: 'amount',
      sorter: (a, b) => b.amount - a.amount,
      render: (amount) => (
        <Text style={{ color: colors.error, fontWeight: 600 }}>
          ${amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Last Payment',
      dataIndex: 'paymentDate',
      sorter: (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
      render: (v) => <Text type="secondary">{formatDate(v)}</Text>,
    },
    {
      title: 'Next Due Date',
      dataIndex: 'nextDueDate',
      sorter: (a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate),
      render: (v) => {
        const isOverdue = dayjs(v).isBefore(dayjs());
        return (
          <Text type={isOverdue ? 'danger' : undefined}>{formatDate(v)}</Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => (
        <OverdueTag nextDueDate={record.nextDueDate} status={status} />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => {
        const sent = isSent(record.memberId);
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
          <Tooltip title="Simulate sending a payment due reminder">
            <Button
              type="primary"
              size="small"
              danger
              icon={<SendOutlined />}
              onClick={() => handleSend(record)}
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
          <DollarOutlined style={{ color: colors.error }} />
          <span>Payment Due Reminders</span>
          <Tag color="red">{payments.length} payment{payments.length !== 1 ? 's' : ''}</Tag>
        </Space>
      }
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 0 } }}
    >
      <Table
        dataSource={payments}
        columns={columns}
        rowKey={(r) => `${r.id}-${r.memberId}`}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 760 }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: colors.success, marginBottom: 8, display: 'block' }} />
              <Text type="secondary">No overdue or pending payments match the current filters.</Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default PaymentReminderTable;
