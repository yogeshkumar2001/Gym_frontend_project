import React from 'react';
import { Table, Tag, Typography, Tooltip, Space } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utils/dateUtils';

const { Text } = Typography;

// ─── Row class for invalid highlighting ───────────────────────────────────────
const rowClassName = (record) => (record.isValid ? '' : 'import-row-invalid');

const PreviewTable = () => {
  const validationResult = useSelector((s) => s.import.validationResult);

  const columns = [
    {
      title: '#',
      dataIndex: 'rowIndex',
      width: 50,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 90,
      render: (_, record) =>
        record.isValid ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag>
        ) : (
          <Tooltip
            title={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {record.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            }
          >
            <Tag icon={<CloseCircleOutlined />} color="error">Invalid</Tag>
          </Tooltip>
        ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      render: (v, record) => (
        <Space>
          {!v && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          <Text type={!v ? 'danger' : undefined}>{v || '(missing)'}</Text>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (v) => (
        <Text type={!v ? 'danger' : undefined}>{v || '(missing)'}</Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (v) => <Text type="secondary">{v || '—'}</Text>,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      width: 100,
      render: (v) => {
        const colors = { monthly: 'blue', quarterly: 'purple', annually: 'gold' };
        return v ? (
          <Tag color={colors[v] || 'default'} style={{ textTransform: 'capitalize' }}>
            {v}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      render: (v, record) => {
        const hasDateError = record.errors?.some((e) => e.includes('date'));
        return (
          <Text type={hasDateError ? 'danger' : undefined}>
            {v ? formatDate(v) : '—'}
          </Text>
        );
      },
    },
    {
      title: 'Fee (₹)',
      dataIndex: 'feeAmount',
      width: 90,
      render: (v, record) => {
        const hasFeeError = record.errors?.some((e) => e.includes('Fee'));
        return (
          <Text type={hasFeeError ? 'danger' : undefined}>
            {v || '—'}
          </Text>
        );
      },
    },
  ];

  return (
    <>
      {/* Inline style for invalid row highlight */}
      <style>{`
        .import-row-invalid td {
          background: #fff2f0 !important;
        }
        .import-row-invalid:hover td {
          background: #ffe7e5 !important;
        }
      `}</style>

      <Table
        dataSource={validationResult.slice(0, 10)}
        columns={columns}
        rowKey="rowIndex"
        rowClassName={rowClassName}
        pagination={false}
        size="small"
        scroll={{ x: 780 }}
        locale={{ emptyText: 'No rows to preview' }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />

      {validationResult.length > 10 && (
        <Text type="secondary" style={{ display: 'block', marginTop: 8, textAlign: 'right' }}>
          Showing first 10 of {validationResult.length} rows.
        </Text>
      )}
    </>
  );
};

export default PreviewTable;
