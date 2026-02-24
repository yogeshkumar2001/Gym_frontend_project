import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Statistic,
  Card,
  message,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentsThunk, createPaymentThunk, deletePaymentThunk } from '../features/payments/paymentsSlice';
import { updateMember } from '../features/members/membersSlice';
import {
  selectFilteredPayments,
  selectPaymentsLoading,
} from '../features/payments/paymentsSelectors';
import {
  selectMonthlyRevenue,
  selectPendingAmount,
  selectUpcomingRenewalsCount,
  selectPaidPaymentsCount,
} from '../features/dashboard/dashboardSelectors';
import { PLAN_CONFIG } from '../constants/memberConstants';
import { PAYMENT_FILTER_STATUS_OPTIONS } from '../constants/paymentConstants';
import GlobalFilters from '../components/filters/GlobalFilters';
import PaymentsTable from '../components/payments/PaymentsTable';
import PaymentModal from '../components/payments/PaymentModal';
import PaymentViewModal from '../components/payments/PaymentViewModal';
import { colors } from '../theme/theme';

const { Title } = Typography;

// ─── Summary Stat Cards ───────────────────────────────────────────────────────
const PaymentStats = () => {
  const monthlyRevenue = useSelector(selectMonthlyRevenue);
  const pendingAmount = useSelector(selectPendingAmount);
  const renewals = useSelector(selectUpcomingRenewalsCount);
  const paidCount = useSelector(selectPaidPaymentsCount);

  const stats = [
    {
      title: 'Paid Transactions',
      value: paidCount,
      icon: <CheckCircleOutlined style={{ color: colors.primary }} />,
      color: colors.primary,
      suffix: '',
    },
    {
      title: 'Revenue This Month',
      value: monthlyRevenue,
      icon: <DollarOutlined style={{ color: colors.success }} />,
      color: colors.success,
      prefix: '$',
      precision: 2,
    },
    {
      title: 'Pending / Partial',
      value: pendingAmount,
      icon: <ClockCircleOutlined style={{ color: colors.warning }} />,
      color: colors.warning,
      prefix: '$',
      precision: 2,
    },
    {
      title: 'Renewals (30 days)',
      value: renewals,
      icon: <CalendarOutlined style={{ color: colors.error }} />,
      color: colors.error,
      suffix: ' members',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {stats.map((s) => (
        <Col xs={24} sm={12} lg={6} key={s.title}>
          <Card size="small" hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Statistic
                title={s.title}
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                precision={s.precision}
                valueStyle={{ color: s.color, fontWeight: 700 }}
              />
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: `${s.color}15`,
                }}
              >
                {s.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ─── Payments Page ────────────────────────────────────────────────────────────
const Payments = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();
  const filteredPayments = useSelector(selectFilteredPayments);
  const loading          = useSelector(selectPaymentsLoading);
  const fetchError       = useSelector((s) => s.payments.error);
  const members = useSelector((state) => state.members.list);

  useEffect(() => { dispatch(fetchPaymentsThunk()); }, [dispatch]);

  // ── Record Payment ─────────────────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    async (values) => {
      const member = members.find((m) => m.id === values.memberId);
      if (!member) return;

      const plan = PLAN_CONFIG[member.planId];
      const paymentDate = values.paymentDate.startOf('day').toISOString();

      // Calculate next due date based on plan duration
      const nextDueDate = values.paymentDate
        .add(plan.months, 'month')
        .startOf('day')
        .toISOString();

      try {
        // ── 1. Record the payment ────────────────────────────────────────────
        await dispatch(
          createPaymentThunk({
            memberId: member.id,
            memberName: member.name,
            planId: member.planId,
            planName: member.planName,
            amount: values.amount,
            paymentDate,
            status: values.status,
            method: values.method,
            nextDueDate,
          })
        ).unwrap();

        // ── 2. Update member state based on payment status (local) ───────────
        if (values.status === 'paid') {
          const newExpiryDate = values.paymentDate
            .add(plan.months, 'month')
            .toISOString();
          dispatch(
            updateMember({
              ...member,
              lastPaymentDate: paymentDate,
              expiryDate: newExpiryDate,
              status: 'active',
            })
          );
        } else if (values.status === 'partial') {
          dispatch(
            updateMember({
              ...member,
              lastPaymentDate: paymentDate,
            })
          );
        }

        messageApi.success('Payment recorded.');
        setModalOpen(false);
        form.resetFields();
      } catch (err) {
        messageApi.error(typeof err === 'string' ? err : 'Failed to record payment.');
      }
    },
    [dispatch, members, form, messageApi]
  );

  // ── Delete with confirmation ────────────────────────────────────────────────
  const handleDelete = useCallback(
    (id) => {
      Modal.confirm({
        title: 'Delete Payment',
        icon: <ExclamationCircleOutlined />,
        content:
          'This payment record will be permanently removed. Member expiry dates are not automatically reverted.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            await dispatch(deletePaymentThunk(id)).unwrap();
            messageApi.success('Payment deleted.');
          } catch {
            messageApi.error('Failed to delete payment.');
          }
        },
      });
    },
    [dispatch, messageApi]
  );

  // ── View ───────────────────────────────────────────────────────────────────
  const handleView = useCallback((payment) => {
    setViewPayment(payment);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewPayment(null);
  }, []);

  return (
    <div>
      {contextHolder}
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Payments
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Record Payment
        </Button>
      </div>

      {/* API error banner */}
      {fetchError && (
        <Alert
          type="error"
          message="Failed to load payments"
          description={fetchError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Revenue Stats */}
      <PaymentStats />

      {/* Filters — payment-context status options */}
      <GlobalFilters
        statusOptions={PAYMENT_FILTER_STATUS_OPTIONS}
        searchPlaceholder="Search member name..."
      />

      {/* Payments Table */}
      <PaymentsTable
        data={filteredPayments}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        open={modalOpen}
        form={form}
        members={members}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
      />

      {/* View Payment Details Modal */}
      <PaymentViewModal
        open={Boolean(viewPayment)}
        payment={viewPayment}
        onClose={closeViewModal}
      />
    </div>
  );
};

export default Payments;
