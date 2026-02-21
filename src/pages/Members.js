import React, { useState, useCallback } from 'react';
import { Typography, Button, Form, Modal, Row, Col, Statistic, Card } from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addMember,
  updateMember,
  deleteMember,
} from '../features/members/membersSlice';
import {
  selectFilteredMembers,
  selectMembersLoading,
  selectActiveMembersCount,
  selectExpiredMembersCount,
  selectTotalCount,
} from '../features/members/membersSelectors';
import { FORM_PLAN_OPTIONS } from '../constants/memberConstants';
import GlobalFilters from '../components/filters/GlobalFilters';
import MembersTable from '../components/members/MembersTable';
import MemberModal from '../components/members/MemberModal';
import { colors } from '../theme/theme';

const { Title } = Typography;

// ─── Summary Cards ────────────────────────────────────────────────────────────
const SummaryCards = () => {
  const total = useSelector(selectTotalCount);
  const active = useSelector(selectActiveMembersCount);
  const expired = useSelector(selectExpiredMembersCount);

  const stats = [
    {
      title: 'Total Members',
      value: total,
      icon: <TeamOutlined style={{ color: colors.primary }} />,
      color: colors.primary,
    },
    {
      title: 'Active',
      value: active,
      icon: <CheckCircleOutlined style={{ color: colors.success }} />,
      color: colors.success,
    },
    {
      title: 'Expired',
      value: expired,
      icon: <ClockCircleOutlined style={{ color: colors.error }} />,
      color: colors.error,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {stats.map((s) => (
        <Col xs={24} sm={8} key={s.title}>
          <Card size="small">
            <Statistic
              title={s.title}
              value={s.value}
              prefix={s.icon}
              valueStyle={{ color: s.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ─── Members Page ─────────────────────────────────────────────────────────────
const Members = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalState, setModalState] = useState({ open: false, member: null });

  const filteredMembers = useSelector(selectFilteredMembers);
  const loading = useSelector(selectMembersLoading);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setModalState({ open: true, member: null });
  }, []);

  const openEdit = useCallback((member) => {
    setModalState({ open: true, member });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, member: null });
    form.resetFields();
  }, [form]);

  // ── Delete with confirmation ───────────────────────────────────────────────
  const handleDelete = useCallback(
    (id) => {
      Modal.confirm({
        title: 'Delete Member',
        icon: <ExclamationCircleOutlined />,
        content: 'This member will be permanently removed. This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => dispatch(deleteMember(id)),
      });
    },
    [dispatch]
  );

  // ── Form submit (Add / Edit) ───────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    (values) => {
      const joiningDate = values.joiningDate.startOf('day').toISOString();
      const expiryDate = values.joiningDate
        .add(values.duration, 'month')
        .toISOString();

      const planName =
        FORM_PLAN_OPTIONS.find((p) => p.value === values.planId)?.label ?? '';

      if (modalState.member) {
        // ── Edit ──
        dispatch(
          updateMember({
            ...modalState.member,        // preserve id, lastPaymentDate
            ...values,
            joiningDate,
            expiryDate,
            planName,
          })
        );
      } else {
        // ── Add ──
        // Note: id uses Date.now() for local state.
        // Replace with response.data.id when backend is integrated.
        dispatch(
          addMember({
            id: Date.now(),
            ...values,
            joiningDate,
            expiryDate,
            planName,
            lastPaymentDate: joiningDate,
          })
        );
      }

      closeModal();
    },
    [dispatch, modalState.member, closeModal]
  );

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
          Members
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Member
        </Button>
      </div>

      {/* Quick Stats */}
      <SummaryCards />

      {/* Global Filters */}
      <GlobalFilters />

      {/* Table */}
      <MembersTable
        data={filteredMembers}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Modal */}
      <MemberModal
        open={modalState.open}
        member={modalState.member}
        form={form}
        onSubmit={handleFormSubmit}
        onCancel={closeModal}
      />
    </div>
  );
};

export default Members;
