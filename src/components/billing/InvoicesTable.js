import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography } from 'antd';
import { EyeOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '../../theme/theme';
import { INVOICE_STATUS_CONFIG } from '../../constants/billingConstants';

const { Text } = Typography;

const buildColumns = (onView, onDownload, onDelete) => [
  {
    title: 'Invoice #',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    fixed: 'left',
    width: 110,
    render: (v) => <Text strong style={{ color: colors.primary }}>{v}</Text>,
  },
  {
    title: 'Member',
    dataIndex: 'memberName',
    key: 'memberName',
    width: 160,
    ellipsis: true,
    render: (name, rec) => (
      <div>
        <div><Text strong>{name}</Text></div>
        <Text type="secondary" style={{ fontSize: 11 }}>{rec.memberEmail}</Text>
      </div>
    ),
    sorter: (a, b) => a.memberName.localeCompare(b.memberName),
  },
  {
    title: 'Plan',
    dataIndex: 'planName',
    key: 'planName',
    width: 110,
    render: (v, rec) => {
      const colorMap = { monthly: 'blue', quarterly: 'purple', annually: 'gold' };
      return <Tag color={colorMap[rec.planId] ?? 'default'}>{v}</Tag>;
    },
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    align: 'right',
    render: (v) => (
      <Text strong style={{ color: colors.success }}>
        ${Number(v).toFixed(2)}
      </Text>
    ),
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: 'Issue Date',
    dataIndex: 'issueDate',
    key: 'issueDate',
    width: 120,
    render: (v) => dayjs(v).format('MMM D, YYYY'),
    sorter: (a, b) => dayjs(a.issueDate).valueOf() - dayjs(b.issueDate).valueOf(),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Due Date',
    dataIndex: 'dueDate',
    key: 'dueDate',
    width: 120,
    render: (v, rec) => (
      <Text style={{ color: rec.status === 'overdue' ? colors.error : colors.textPrimary }}>
        {dayjs(v).format('MMM D, YYYY')}
      </Text>
    ),
    sorter: (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (v) => {
      const cfg = INVOICE_STATUS_CONFIG[v] ?? { label: v, color: 'default' };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
    filters: [
      { text: 'Paid', value: 'paid' },
      { text: 'Unpaid', value: 'unpaid' },
      { text: 'Overdue', value: 'overdue' },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (_, record) => (
      <Space size={4}>
        <Tooltip title="View Invoice">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(record)}
          />
        </Tooltip>
        <Tooltip title="Download (Mock)">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => onDownload(record)}
          />
        </Tooltip>
        <Tooltip title="Delete Invoice">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// ─── InvoicesTable ────────────────────────────────────────────────────────────
const InvoicesTable = ({ data, onView, onDownload, onDelete }) => {
  const columns = useMemo(
    () => buildColumns(onView, onDownload, onDelete),
    [onView, onDownload, onDelete]
  );

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      scroll={{ x: 900 }}
      size="middle"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} invoices`,
      }}
    />
  );
};

export default InvoicesTable;
