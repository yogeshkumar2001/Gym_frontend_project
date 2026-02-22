import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Tooltip, Card } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PLAN_CONFIG, STATUS_CONFIG } from '../../constants/memberConstants';
import { formatDate, isExpired } from '../../utils/dateUtils';
import { colors } from '../../theme/theme';

// ─── Column Definitions ───────────────────────────────────────────────────────
// Extracted to a factory function so handlers can be injected without
// re-creating the array on every render (see useMemo below).
const buildColumns = (onEdit, onDelete, onViewProfile) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 65,
    sorter: (a, b) => a.id - b.id,
    fixed: 'left',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    minWidth: 180,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (text, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{text}</div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          {record.email}
        </div>
      </div>
    ),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
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
    title: 'Joining Date',
    dataIndex: 'joiningDate',
    key: 'joiningDate',
    width: 135,
    sorter: (a, b) => dayjs(a.joiningDate).unix() - dayjs(b.joiningDate).unix(),
    defaultSortOrder: 'descend',
    render: (date) => formatDate(date),
  },
  {
    title: 'Expiry Date',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 135,
    sorter: (a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
    render: (date) => {
      const expired = isExpired(date);
      return (
        <span style={{ color: expired ? colors.error : colors.success, fontWeight: 500 }}>
          {formatDate(date)}
        </span>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    sorter: (a, b) => a.status.localeCompare(b.status),
    render: (status) => {
      const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'default' };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Fee',
    dataIndex: 'feeAmount',
    key: 'feeAmount',
    width: 100,
    sorter: (a, b) => a.feeAmount - b.feeAmount,
    render: (amount) => `$${Number(amount).toFixed(2)}`,
    align: 'right',
  },
  {
    title: 'Last Payment',
    dataIndex: 'lastPaymentDate',
    key: 'lastPaymentDate',
    width: 135,
    sorter: (a, b) =>
      dayjs(a.lastPaymentDate).unix() - dayjs(b.lastPaymentDate).unix(),
    render: (date) => formatDate(date),
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (_, record) => (
      <Space size={4}>
        <Tooltip title="View profile">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewProfile(record.id)}
          />
        </Tooltip>
        <Tooltip title="Edit member">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Delete member">
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
  showTotal: (total, range) =>
    `${range[0]}–${range[1]} of ${total} members`,
};

// ─── MembersTable ─────────────────────────────────────────────────────────────
const MembersTable = ({ data, loading, onEdit, onDelete }) => {
  const navigate   = useNavigate();
  const columns = useMemo(
    () => buildColumns(onEdit, onDelete, (id) => navigate(`/members/${id}`)),
    [onEdit, onDelete, navigate]
  );

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={paginationConfig}
        scroll={{ x: 1300 }}
        sticky
        size="middle"
        rowClassName={(record) =>
          record.status === 'expired' ? 'row-expired' : ''
        }
      />
    </Card>
  );
};

export default MembersTable;
