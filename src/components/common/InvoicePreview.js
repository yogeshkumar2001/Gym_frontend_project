import React from 'react';
import { Card, Descriptions, Divider, Tag, Typography, Table } from 'antd';
import dayjs from 'dayjs';
import { colors } from '../../theme/theme';
import { INVOICE_STATUS_CONFIG } from '../../constants/billingConstants';

const { Title, Text } = Typography;

// ─── InvoicePreview ────────────────────────────────────────────────────────────
// Clean read-only invoice layout.
// `invoice` must include the derived `status` field (use selectInvoicesWithStatus).
const InvoicePreview = ({ invoice }) => {
  if (!invoice) return null;

  const statusCfg = INVOICE_STATUS_CONFIG[invoice.status] ?? { label: invoice.status, color: 'default' };

  const lineItems = [
    {
      key: '1',
      description: `${invoice.planName} Membership`,
      qty: 1,
      unitPrice: invoice.amount,
      total: invoice.amount,
    },
  ];

  const lineColumns = [
    { title: 'Description', dataIndex: 'description', key: 'description', width: '50%' },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', align: 'center', width: '10%' },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: '20%',
      render: (v) => `$${Number(v).toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: '20%',
      render: (v) => (
        <Text strong>${Number(v).toFixed(2)}</Text>
      ),
    },
  ];

  return (
    <Card
      bordered
      style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'monospace' }}
      bodyStyle={{ padding: 32 }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: colors.primary }}>
            GymPro
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Professional Fitness Center
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Title level={4} style={{ margin: 0 }}>
            {invoice.invoiceNumber}
          </Title>
          <Tag color={statusCfg.color} style={{ marginTop: 6, fontSize: 12 }}>
            {statusCfg.label}
          </Tag>
        </div>
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* ── Bill To + Invoice Details ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        {/* Bill To */}
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            Bill To
          </Text>
          <div style={{ marginTop: 6 }}>
            <div><Text strong>{invoice.memberName}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 13 }}>{invoice.memberEmail}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 13 }}>{invoice.memberPhone}</Text></div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div style={{ flex: 1 }}>
          <Descriptions column={1} size="small" style={{ fontSize: 13 }}>
            <Descriptions.Item label="Issue Date">
              {dayjs(invoice.issueDate).format('MMM D, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              <Text
                style={{
                  color:
                    invoice.status === 'overdue' ? colors.error : colors.textPrimary,
                  fontWeight: invoice.status === 'overdue' ? 600 : 400,
                }}
              >
                {dayjs(invoice.dueDate).format('MMM D, YYYY')}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Plan">
              {invoice.planName}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* ── Line Items Table ── */}
      <Table
        dataSource={lineItems}
        columns={lineColumns}
        pagination={false}
        size="small"
        rowKey="key"
        style={{ marginBottom: 0 }}
      />

      {/* ── Totals ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 12,
          paddingTop: 12,
          borderTop: `2px solid ${colors.border}`,
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ marginRight: 24 }}>
            Total Due
          </Text>
          <Title level={4} style={{ display: 'inline', color: colors.primary }}>
            ${Number(invoice.amount).toFixed(2)}
          </Title>
        </div>
      </div>

      <Divider style={{ margin: '20px 0 12px' }} />

      {/* ── Footer ── */}
      <Text type="secondary" style={{ fontSize: 11 }}>
        Thank you for choosing GymPro! For queries, contact support@gympro.com · +1 (555) 000-0000
      </Text>
    </Card>
  );
};

export default InvoicePreview;
