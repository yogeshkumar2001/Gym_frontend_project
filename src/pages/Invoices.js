import React, { useCallback, useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Modal,
  message,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { addInvoice, deleteInvoice } from '../features/billing/billingSlice';
import {
  selectFilteredInvoices,
  selectInvoiceStats,
  selectInvoicesWithStatus,
} from '../features/billing/billingSelectors';
import { INVOICE_FILTER_STATUS_OPTIONS } from '../constants/billingConstants';

import GlobalFilters from '../components/filters/GlobalFilters';
import InvoicesTable from '../components/billing/InvoicesTable';
import InvoiceModal from '../components/billing/InvoiceModal';
import InvoicePreview from '../components/common/InvoicePreview';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── InvoiceStats ─────────────────────────────────────────────────────────────
const InvoiceStats = () => {
  const stats = useSelector(selectInvoiceStats);
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="Total Invoices"
            value={stats.total}
            prefix={<FileTextOutlined style={{ color: colors.primary }} />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="Paid"
            value={stats.paid}
            prefix={<CheckCircleOutlined style={{ color: colors.success }} />}
            valueStyle={{ color: colors.success }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="Unpaid"
            value={stats.unpaid}
            prefix={<ClockCircleOutlined style={{ color: colors.warning }} />}
            valueStyle={{ color: colors.warning }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="Overdue"
            value={stats.overdue}
            prefix={<ExclamationCircleOutlined style={{ color: colors.error }} />}
            valueStyle={{ color: colors.error }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// ─── Invoices Page ────────────────────────────────────────────────────────────
const Invoices = () => {
  const dispatch = useDispatch();

  const filteredInvoices = useSelector(selectFilteredInvoices);
  // Need the full list (with status) to look up a single invoice for preview
  const allInvoices = useSelector(selectInvoicesWithStatus);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // ── Next available invoice id ──────────────────────────────────────────────
  const nextId = useSelector((state) =>
    state.billing.list.reduce((max, inv) => Math.max(max, inv.id), 0) + 1
  );
  const nextNumber = useSelector((state) => {
    const max = state.billing.list.reduce(
      (m, inv) => Math.max(m, parseInt(inv.invoiceNumber.replace('INV-', ''), 10)),
      0
    );
    return `INV-${String(max + 1).padStart(4, '0')}`;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    (values) => {
      const invoice = {
        id: nextId,
        invoiceNumber: nextNumber,
        memberId: values.memberId,
        memberName: values.memberName,
        memberEmail: values.memberEmail,
        memberPhone: values.memberPhone,
        planId: values.planId,
        planName: values.planName,
        amount: values.amount,
        issueDate: dayjs(values.issueDate).toISOString(),
        dueDate: dayjs(values.dueDate).toISOString(),
        paymentId: null,
      };
      dispatch(addInvoice(invoice));
      setGenerateOpen(false);
      message.success(`Invoice ${invoice.invoiceNumber} generated successfully`);
    },
    [dispatch, nextId, nextNumber]
  );

  const handleView = useCallback(
    (record) => {
      // Pull the derived-status version from the full list
      const withStatus = allInvoices.find((inv) => inv.id === record.id);
      setPreviewInvoice(withStatus ?? record);
    },
    [allInvoices]
  );

  const handleDownload = useCallback((record) => {
    message.success(
      `Invoice ${record.invoiceNumber} download started (mock — PDF generation coming soon)`
    );
  }, []);

  const handleDelete = useCallback(
    (record) => {
      Modal.confirm({
        title: `Delete ${record.invoiceNumber}?`,
        content: `This will permanently remove the invoice for ${record.memberName}.`,
        okText: 'Delete',
        okType: 'danger',
        onOk: () => {
          dispatch(deleteInvoice(record.id));
          message.success(`Invoice ${record.invoiceNumber} deleted`);
        },
      });
    },
    [dispatch]
  );

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Invoices
        </Title>
        <button
          onClick={() => setGenerateOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            background: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <PlusOutlined /> Generate Invoice
        </button>
      </div>

      {/* Summary stat cards */}
      <InvoiceStats />

      {/* Global Filters — invoice-specific status options, no plan filter needed */}
      <GlobalFilters
        statusOptions={INVOICE_FILTER_STATUS_OPTIONS}
        searchPlaceholder="Search member name or invoice number..."
        showPlanFilter={false}
      />

      {/* Invoices table */}
      <Card bodyStyle={{ padding: 0 }} style={{ marginTop: 16 }}>
        <InvoicesTable
          data={filteredInvoices}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </Card>

      {/* Generate Invoice Modal */}
      <InvoiceModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Invoice Preview Modal */}
      <Modal
        title={
          previewInvoice ? (
            <Text>
              Invoice Preview —{' '}
              <Text strong style={{ color: colors.primary }}>
                {previewInvoice.invoiceNumber}
              </Text>
            </Text>
          ) : (
            'Invoice Preview'
          )
        }
        open={!!previewInvoice}
        onCancel={() => setPreviewInvoice(null)}
        footer={[
          <button
            key="download"
            onClick={() => {
              handleDownload(previewInvoice);
              setPreviewInvoice(null);
            }}
            style={{
              padding: '5px 16px',
              background: colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Download PDF (Mock)
          </button>,
        ]}
        width={720}
        destroyOnClose
      >
        <InvoicePreview invoice={previewInvoice} />
      </Modal>
    </div>
  );
};

export default Invoices;
