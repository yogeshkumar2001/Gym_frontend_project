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
  ThunderboltOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { selectWorkoutTemplateStats, selectAllTemplates } from '../features/workouts/workoutsSelectors';
import { deleteTemplate } from '../features/workouts/workoutsSlice';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Lookup maps ──────────────────────────────────────────────────────────────
const DIFFICULTY_COLOR = {
  beginner:     'green',
  intermediate: 'orange',
  advanced:     'red',
};

const STATUS_COLOR = {
  active: 'green',
  draft:  'default',
};

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={STYLES.divider}>
    <Text style={STYLES.dividerLabel}>{label}</Text>
  </Divider>
);

// ─── Workouts (list page) ─────────────────────────────────────────────────────
// Displays all workout templates with summary stats and actions.
// Navigate to WorkoutBuilder for create (/workouts/new) and edit (/workouts/edit/:id).
const Workouts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const [search, setSearch] = useState('');

  const stats     = useSelector(selectWorkoutTemplateStats);
  const templates = useSelector(selectAllTemplates);

  // ── Client-side search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q),
    );
  }, [templates, search]);

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = (template) => {
    dispatch(deleteTemplate(template.id));
    messageApi.success(`"${template.name}" deleted.`);
  };

  // ── Summary cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    {
      title: 'Total Templates',
      value: stats.totalTemplates,
      icon:  <FileTextOutlined style={{ fontSize: 22, color: colors.primary }} />,
      color: colors.primary,
    },
    {
      title: 'Active Templates',
      value: stats.activeTemplates,
      icon:  <CheckCircleOutlined style={{ fontSize: 22, color: colors.success }} />,
      color: colors.success,
    },
    {
      title: 'Total Exercises',
      value: stats.totalExercises,
      icon:  <ThunderboltOutlined style={{ fontSize: 22, color: colors.warning }} />,
      color: colors.warning,
    },
    {
      title: 'Total Days',
      value: stats.totalDays,
      icon:  <AppstoreOutlined style={{ fontSize: 22, color: colors.info }} />,
      color: colors.info,
    },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title:     'Template Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a, b) => a.name.localeCompare(b.name),
      render:    (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.description && (
            <Text type="secondary" style={STYLES.descriptionText}>
              {record.description.length > 70
                ? `${record.description.slice(0, 70)}…`
                : record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title:     'Days',
      dataIndex: 'days',
      key:       'days',
      width:     80,
      sorter:    (a, b) => a.days.length - b.days.length,
      render:    (days) => days.length,
    },
    {
      title:  'Exercises',
      key:    'exercises',
      width:  100,
      sorter: (a, b) => {
        const totalA = a.days.reduce((s, d) => s + d.exercises.length, 0);
        const totalB = b.days.reduce((s, d) => s + d.exercises.length, 0);
        return totalA - totalB;
      },
      render: (_, record) =>
        record.days.reduce((s, d) => s + d.exercises.length, 0),
    },
    {
      title:     'Difficulty',
      dataIndex: 'difficulty',
      key:       'difficulty',
      width:     130,
      filters: [
        { text: 'Beginner',     value: 'beginner'     },
        { text: 'Intermediate', value: 'intermediate'  },
        { text: 'Advanced',     value: 'advanced'      },
      ],
      onFilter:  (value, record) => record.difficulty === value,
      render:    (diff) => (
        <Tag color={DIFFICULTY_COLOR[diff] ?? 'default'}>
          {diff.charAt(0).toUpperCase() + diff.slice(1)}
        </Tag>
      ),
    },
    {
      title:     'Created',
      dataIndex: 'createdAt',
      key:       'createdAt',
      width:     120,
      sorter:    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render:    (date) => (date ? dayjs(date).format('MMM D, YYYY') : '—'),
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     90,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Draft',  value: 'draft'  },
      ],
      onFilter:  (value, record) => record.status === value,
      render:    (status) => (
        <Tag color={STATUS_COLOR[status] ?? 'default'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  90,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit template">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/workouts/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete template">
            <Popconfirm
              title="Delete this template?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {contextHolder}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={STYLES.header}>
        <Col>
          <Space align="center" size={12}>
            <ThunderboltOutlined style={STYLES.titleIcon} />
            <div>
              <Title level={3} style={STYLES.title}>Workout Templates</Title>
              <Text type="secondary">
                Build and manage reusable workout programs for your members.
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/workouts/new')}
          >
            Create Template
          </Button>
        </Col>
      </Row>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <SectionDivider label="Overview" />

      <Row gutter={[16, 16]} style={STYLES.cardsRow}>
        {summaryCards.map((card) => (
          <Col key={card.title} xs={12} sm={12} md={6}>
            <Card
              style={{ borderTop: `3px solid ${card.color}` }}
              styles={{ body: STYLES.cardBody }}
            >
              <Row justify="space-between" align="top">
                <Col>
                  <Text style={STYLES.cardLabel}>{card.title}</Text>
                  <Statistic
                    value={card.value}
                    valueStyle={{ ...STYLES.cardValue, color: card.color }}
                  />
                </Col>
                <Col>{card.icon}</Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Templates table ───────────────────────────────────────────────── */}
      <SectionDivider label="All Templates" />

      <Row justify="end" style={STYLES.searchRow}>
        <Col xs={24} sm={12} md={8}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize:       10,
          showSizeChanger: true,
          showTotal:      (total) => `${total} template${total !== 1 ? 's' : ''}`,
        }}
        size="middle"
        locale={{ emptyText: 'No templates yet. Click "Create Template" to get started.' }}
      />
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  header: {
    marginBottom: 20,
  },
  titleIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    margin: 0,
  },
  divider: {
    margin: '0 0 20px',
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: colors.textSecondary,
  },
  cardsRow: {
    marginBottom: 40,
  },
  cardBody: {
    padding: '20px 24px',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textSecondary,
    display: 'block',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  searchRow: {
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
  },
};

export default Workouts;
