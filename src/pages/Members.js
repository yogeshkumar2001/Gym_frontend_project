import React, { useState, useCallback, useEffect } from 'react';
import { Typography, Button, Form, Modal, Row, Col, Statistic, Card, message, Alert } from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchMembersThunk,
  createMemberThunk,
  updateMemberThunk,
  deleteMemberThunk,
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
import EmptyState from '../components/common/EmptyState';
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
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalState, setModalState] = useState({ open: false, member: null });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => { dispatch(fetchMembersThunk()); }, [dispatch]);

  const filteredMembers = useSelector(selectFilteredMembers);
  const loading         = useSelector(selectMembersLoading);
  const totalCount      = useSelector(selectTotalCount);
  const fetchError      = useSelector((s) => s.members.error);

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
        onOk: async () => {
          try {
            await dispatch(deleteMemberThunk(id)).unwrap();
            messageApi.success('Member deleted.');
          } catch {
            messageApi.error('Failed to delete member.');
          }
        },
      });
    },
    [dispatch, messageApi]
  );

  // ── Form submit (Add / Edit) ───────────────────────────────────────────────
  const handleFormSubmit = useCallback(
    async (values) => {
      const joiningDate = values.joiningDate.startOf('day').toISOString();
      const expiryDate = values.joiningDate
        .add(values.duration, 'month')
        .toISOString();

      const planName =
        FORM_PLAN_OPTIONS.find((p) => p.value === values.planId)?.label ?? '';

      try {
        if (modalState.member) {
          await dispatch(
            updateMemberThunk({
              id: modalState.member.id,
              data: { ...modalState.member, ...values, joiningDate, expiryDate, planName },
            })
          ).unwrap();
          messageApi.success('Member updated.');
        } else {
          await dispatch(
            createMemberThunk({ ...values, joiningDate, expiryDate, planName, lastPaymentDate: joiningDate })
          ).unwrap();
          messageApi.success('Member added.');
        }
        closeModal();
      } catch (err) {
        messageApi.error(typeof err === 'string' ? err : 'Operation failed.');
      }
    },
    [dispatch, modalState.member, closeModal, messageApi]
  );

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
          Members
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Member
        </Button>
      </div>

      {/* API error banner */}
      {fetchError && (
        <Alert
          type="error"
          message="Failed to load members"
          description={fetchError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Quick Stats */}
      <SummaryCards />

      {/* Empty state — shown when gym has no members yet */}
      {!loading && !fetchError && totalCount === 0 ? (
        <EmptyState
          icon={<TeamOutlined />}
          title="No members yet"
          description="Add your first member manually or import a list from a CSV file."
          primaryActionLabel="Add Member"
          onPrimaryAction={openAdd}
          secondaryActionLabel="Import CSV"
          secondaryActionLink="/upload"
        />
      ) : (
        <>
          {/* Global Filters */}
          <GlobalFilters />

          {/* Table */}
          <MembersTable
            data={filteredMembers}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </>
      )}

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
