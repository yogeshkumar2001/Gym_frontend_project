import React, { useState, useMemo, useEffect } from 'react';
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
  FireOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  selectDietTemplateStats,
  selectAllDietTemplates,
} from '../features/diets/dietsSelectors';
import { fetchDietsThunk, deleteDietThunk } from '../features/diets/dietsSlice';
import EmptyState from '../components/common/EmptyState';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Lookup maps ──────────────────────────────────────────────────────────────
const GOAL_COLOR = {
  cutting:     'red',
  bulking:     'blue',
  maintenance: 'green',
  custom:      'purple',
};

const STATUS_COLOR = {
  active: 'green',
  draft:  'default',
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={STYLES.divider}>
    <Text style={STYLES.dividerLabel}>{label}</Text>
  </Divider>
);

// ─── Diets (list page) ────────────────────────────────────────────────────────
// Displays all diet templates with summary stats and actions.
// Navigate to DietBuilder for create (/diets/new) or edit (/diets/edit/:id).
const Diets = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const [search, setSearch] = useState('');

  const stats     = useSelector(selectDietTemplateStats);
  const templates = useSelector(selectAllDietTemplates);

  useEffect(() => { dispatch(fetchDietsThunk()); }, [dispatch]);

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
  const handleDelete = async (template) => {
    try {
      await dispatch(deleteDietThunk(template.id)).unwrap();
      messageApi.success(`"${template.name}" deleted.`);
    } catch {
      messageApi.error('Failed to delete template.');
    }
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
      title: 'Total Meals',
      value: stats.totalMeals,
      icon:  <UnorderedListOutlined style={{ fontSize: 22, color: colors.warning }} />,
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
      title:  'Days',
      key:    'days',
      width:  80,
      sorter: (a, b) => a.days.length - b.days.length,
      render: (_, record) => record.days.length,
    },
    {
      title:  'Total Meals',
      key:    'meals',
      width:  110,
      sorter: (a, b) => {
        const countMeals = (t) =>
          t.days.reduce((s, d) => s + d.meals.length, 0);
        return countMeals(a) - countMeals(b);
      },
      render: (_, record) =>
        record.days.reduce((s, d) => s + d.meals.length, 0),
    },
    {
      title:     'Goal Type',
      dataIndex: 'goalType',
      key:       'goalType',
      width:     130,
      filters: [
        { text: 'Cutting',     value: 'cutting'     },
        { text: 'Bulking',     value: 'bulking'     },
        { text: 'Maintenance', value: 'maintenance'  },
        { text: 'Custom',      value: 'custom'      },
      ],
      onFilter:  (value, record) => record.goalType === value,
      render:    (goal) => (
        <Tag color={GOAL_COLOR[goal] ?? 'default'}>{capitalize(goal)}</Tag>
      ),
    },
    {
      title:     'Created',
      dataIndex: 'createdAt',
      key:       'createdAt',
      width:     120,
      sorter:    (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
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
        <Tag color={STATUS_COLOR[status] ?? 'default'}>{capitalize(status)}</Tag>
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
              onClick={() => navigate(`/diets/edit/${record.id}`)}
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
            <FireOutlined style={STYLES.titleIcon} />
            <div>
              <Title level={3} style={STYLES.title}>Diet Templates</Title>
              <Text type="secondary">
                Build and manage structured nutrition programs for your members.
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/diets/new')}
          >
            Create Template
          </Button>
        </Col>
      </Row>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {templates.length === 0 ? (
        <EmptyState
          icon={<FireOutlined />}
          title="No diet templates yet"
          description="Build structured nutrition programs that can be assigned to any member."
          primaryActionLabel="Create Template"
          primaryActionLink="/diets/new"
        />
      ) : (
        <>
          {/* ── Summary cards ──────────────────────────────────────────────── */}
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

          {/* ── Templates table ─────────────────────────────────────────────── */}
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
              pageSize:        10,
              showSizeChanger: true,
              showTotal:       (total) =>
                `${total} template${total !== 1 ? 's' : ''}`,
            }}
            size="middle"
          />
        </>
      )}
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
    color: colors.warning,
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

export default Diets;
