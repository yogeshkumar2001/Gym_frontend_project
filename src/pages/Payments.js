import React, { useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Statistic,
  Card,
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
import { addPayment, deletePayment } from '../features/payments/paymentsSlice';
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

  const filteredPayments = useSelector(selectFilteredPayments);
  const loading = useSelector(selectPaymentsLoading);
  const members = useSelector((state) => state.members.list);

  // ── Record Payment ─────────────────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    (values) => {
      const member = members.find((m) => m.id === values.memberId);
      if (!member) return;

      const plan = PLAN_CONFIG[member.planId];
      const paymentDate = values.paymentDate.startOf('day').toISOString();

      // Calculate next due date based on plan duration
      const nextDueDate = values.paymentDate
        .add(plan.months, 'month')
        .startOf('day')
        .toISOString();

      // ── 1. Record the payment ──────────────────────────────────────────────
      // Future: POST /payments  { memberId, amount, paymentDate, status, method }
      dispatch(
        addPayment({
          id: Date.now(),
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
      );

      // ── 2. Update member state based on payment status ─────────────────────
      if (values.status === 'paid') {
        // Full payment: extend expiry and reactivate member
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
        // Partial: update lastPaymentDate only
        dispatch(
          updateMember({
            ...member,
            lastPaymentDate: paymentDate,
          })
        );
      }

      setModalOpen(false);
      form.resetFields();
    },
    [dispatch, members, form]
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
        onOk: () => dispatch(deletePayment(id)),
      });
    },
    [dispatch]
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
