import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Input,
  Popconfirm,
  Statistic,
  Divider,
  Tooltip,
  message,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TrophyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';

import { selectPlanStats } from '../features/plans/plansSelectors';
import { addPlan, updatePlan, deletePlan } from '../features/plans/plansSlice';
import PlanForm from '../components/plans/PlanForm';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={{ margin: '0 0 20px' }}>
    <Text
      style={{
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: colors.textSecondary,
      }}
    >
      {label}
    </Text>
  </Divider>
);

// ─── Status tag ───────────────────────────────────────────────────────────────
const statusColor = { active: 'green', inactive: 'default' };

// ─── Plans ────────────────────────────────────────────────────────────────────
const Plans = () => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  // ── State ────────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('');
  const [formOpen, setFormOpen]           = useState(false);
  const [editingPlan, setEditingPlan]     = useState(null); // null = create mode
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ── Selectors ────────────────────────────────────────────────────────────
  const { plans, summary } = useSelector(selectPlanStats);

  // ── Filtered plans (client-side search) ──────────────────────────────────
  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
    );
  }, [plans, search]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleFormSubmit = (values) => {
    setConfirmLoading(true);

    // Simulate async (replace with api call when backend is ready)
    setTimeout(() => {
      if (editingPlan) {
        dispatch(updatePlan({ ...editingPlan, ...values }));
        messageApi.success(`Plan "${values.name}" updated.`);
      } else {
        dispatch(addPlan({ id: nanoid(), ...values }));
        messageApi.success(`Plan "${values.name}" created.`);
      }
      setConfirmLoading(false);
      setFormOpen(false);
      setEditingPlan(null);
    }, 400);
  };

  const handleDelete = (plan) => {
    dispatch(deletePlan(plan.id));
    messageApi.success(`Plan "${plan.name}" deleted.`);
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingPlan(null);
  };

  // ── Summary cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    {
      title: 'Total Plans',
      value: summary.totalPlans,
      icon: <FileTextOutlined style={{ fontSize: 22, color: colors.primary }} />,
      color: colors.primary,
    },
    {
      title: 'Active Plans',
      value: summary.activePlans,
      icon: <CheckCircleOutlined style={{ fontSize: 22, color: colors.success }} />,
      color: colors.success,
    },
    {
      title: 'Most Popular',
      value: summary.mostPopular?.name ?? '—',
      sub: summary.mostPopular
        ? `${summary.mostPopular.activeMemberCount} active members`
        : 'No active plans',
      icon: <TrophyOutlined style={{ fontSize: 22, color: colors.warning }} />,
      color: colors.warning,
      isText: true,
    },
    {
      title: 'Highest Revenue',
      value: summary.highestRevenue
        ? `$${summary.highestRevenue.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—',
      sub: summary.highestRevenue?.name ?? '',
      icon: <DollarOutlined style={{ fontSize: 22, color: colors.info }} />,
      color: colors.info,
      isText: true,
    },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      width: 120,
      sorter: (a, b) => a.durationMonths - b.durationMonths,
      render: (months) =>
        months === 1 ? '1 month' : `${months} months`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      sorter: (a, b) => a.price - b.price,
      render: (price) =>
        `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Active Members',
      dataIndex: 'activeMemberCount',
      key: 'activeMemberCount',
      width: 140,
      sorter: (a, b) => a.activeMemberCount - b.activeMemberCount,
      render: (count) => (
        <Space>
          <TeamOutlined style={{ color: colors.primary }} />
          <Text>{count}</Text>
        </Space>
      ),
    },
    {
      title: 'Revenue Generated',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 160,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (rev) =>
        `$${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Active',   value: 'active'   },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={statusColor[status] ?? 'default'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit plan">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete plan">
            <Popconfirm
              title="Delete this plan?"
              description={
                record.activeMemberCount > 0
                  ? `${record.activeMemberCount} active member(s) are on this plan. It will still be deleted.`
                  : 'This action cannot be undone.'
              }
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {contextHolder}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space align="center" size={12}>
            <FileTextOutlined style={{ fontSize: 24, color: colors.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Membership Plans</Title>
              <Text type="secondary">Manage billing plans and track their performance.</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            New Plan
          </Button>
        </Col>
      </Row>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <SectionDivider label="Overview" />

      <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
        {summaryCards.map((card) => (
          <Col key={card.title} xs={12} sm={12} md={6}>
            <Card
              styles={{ body: { padding: '20px 24px' } }}
              style={{ borderTop: `3px solid ${card.color}` }}
            >
              <Row justify="space-between" align="top">
                <Col>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {card.title}
                  </Text>
                  {card.isText ? (
                    <div>
                      <Text strong style={{ fontSize: 22, display: 'block', lineHeight: '32px', color: card.color }}>
                        {card.value}
                      </Text>
                      {card.sub && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{card.sub}</Text>
                      )}
                    </div>
                  ) : (
                    <Statistic
                      value={card.value}
                      valueStyle={{ fontSize: 28, fontWeight: 700, color: card.color }}
                    />
                  )}
                </Col>
                <Col>{card.icon}</Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Plans table ──────────────────────────────────────────────────── */}
      <SectionDivider label="All Plans" />

      <Row justify="end" style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      <Table
        dataSource={filteredPlans}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} plans` }}
        size="middle"
        bordered={false}
      />

      {/* ── Plan form modal ───────────────────────────────────────────────── */}
      <PlanForm
        open={formOpen}
        initialValues={editingPlan}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
      />
    </div>
  );
};

export default Plans;
