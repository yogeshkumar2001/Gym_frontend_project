import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Tooltip, Card, Typography } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../../constants/paymentConstants';
import { PLAN_CONFIG } from '../../constants/memberConstants';
import { formatDate } from '../../utils/dateUtils';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Column Definitions ───────────────────────────────────────────────────────
const buildColumns = (onView, onDelete) => [
  {
    title: 'Member',
    dataIndex: 'memberName',
    key: 'memberName',
    minWidth: 160,
    sorter: (a, b) => a.memberName.localeCompare(b.memberName),
    render: (name) => <Text strong>{name}</Text>,
  },
  {
    title: 'Plan',
    dataIndex: 'planName',
    key: 'planName',
    width: 115,
    sorter: (a, b) => a.planId.localeCompare(b.planId),
    render: (planName, record) => {
      const cfg = PLAN_CONFIG[record.planId];
      return (
        <Tag color={cfg?.color ?? 'blue'} style={{ fontWeight: 500 }}>
          {planName}
        </Tag>
      );
    },
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 110,
    sorter: (a, b) => a.amount - b.amount,
    align: 'right',
    render: (amount) => (
      <Text strong style={{ color: colors.success }}>
        ${Number(amount).toFixed(2)}
      </Text>
    ),
  },
  {
    title: 'Payment Date',
    dataIndex: 'paymentDate',
    key: 'paymentDate',
    width: 135,
    sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
    defaultSortOrder: 'descend',
    render: (date) => formatDate(date),
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
    width: 100,
    render: (method) => {
      const cfg = PAYMENT_METHOD_CONFIG[method] ?? { label: method, color: 'default' };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    sorter: (a, b) => a.status.localeCompare(b.status),
    render: (status) => {
      const cfg = PAYMENT_STATUS_CONFIG[status] ?? { label: status, color: 'default' };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Next Due Date',
    dataIndex: 'nextDueDate',
    key: 'nextDueDate',
    width: 135,
    sorter: (a, b) => dayjs(a.nextDueDate).unix() - dayjs(b.nextDueDate).unix(),
    render: (date) => {
      const isOverdue = dayjs().isAfter(dayjs(date));
      return (
        <span style={{ color: isOverdue ? colors.error : colors.textPrimary }}>
          {formatDate(date)}
        </span>
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 90,
    render: (_, record) => (
      <Space size={4}>
        <Tooltip title="View details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(record)}
          />
        </Tooltip>
        <Tooltip title="Delete payment">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record.id)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// ─── Pagination Config ────────────────────────────────────────────────────────
const paginationConfig = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  defaultPageSize: 10,
  showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} payments`,
};

// ─── PaymentsTable ────────────────────────────────────────────────────────────
const PaymentsTable = ({ data, loading, onView, onDelete }) => {
  const columns = useMemo(
    () => buildColumns(onView, onDelete),
    [onView, onDelete]
  );

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={paginationConfig}
        scroll={{ x: 1100 }}
        sticky
        size="middle"
      />
    </Card>
  );
};

export default PaymentsTable;
