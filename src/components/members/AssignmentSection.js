import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Badge,
} from 'antd';
import {
  ThunderboltOutlined,
  FireOutlined,
  SwapOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AssignModal from './AssignModal';
import { colors } from '../../theme/theme';

const { Text, Title } = Typography;

// ─── Section header divider ────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={STYLES.divider}>
    <Text style={STYLES.dividerLabel}>{label}</Text>
  </Divider>
);

// ─── History table columns ────────────────────────────────────────────────────
const historyColumns = [
  {
    title:     'Template',
    dataIndex: 'templateName',
    key:       'templateName',
    render:    (name) => <Text strong>{name}</Text>,
  },
  {
    title:     'Assigned',
    dataIndex: 'assignedDate',
    key:       'assignedDate',
    width:     130,
    render:    (d) => dayjs(d).format('MMM D, YYYY'),
  },
  {
    title:     'Completed',
    dataIndex: 'completedDate',
    key:       'completedDate',
    width:     130,
    render:    (d) => (d ? dayjs(d).format('MMM D, YYYY') : '—'),
  },
  {
    title:  'Status',
    key:    'status',
    width:  110,
    render: () => <Tag color="default">Completed</Tag>,
  },
];

// ─── AssignmentSection ────────────────────────────────────────────────────────
// Reusable section for Workout and Diet plan assignment.
// Renders:
//   1. Active plan card — shows current assignment or empty state
//   2. Assignment history table — completed assignments, newest first
//   3. AssignModal — controlled locally
//
// Props:
//   type             : 'workout' | 'diet'
//   activeAssignment : { id, templateName, assignedDate, ... } | null
//   history          : assignment[]  — completed, sorted newest-first
//   templates        : template[]    — from workoutsSlice or dietsSlice
//   onAssign         : (templateId, templateName, assignedDate: ISO) => void
const AssignmentSection = ({ type, activeAssignment, history, templates, onAssign }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const isWorkout = type === 'workout';
  const label     = isWorkout ? 'Workout' : 'Diet';
  const Icon      = isWorkout ? ThunderboltOutlined : FireOutlined;
  const accentColor = isWorkout ? colors.primary : colors.warning;

  const handleSubmit = (templateId, templateName, assignedDate) => {
    onAssign(templateId, templateName, assignedDate);
    setModalOpen(false);
  };

  return (
    <div style={STYLES.section}>
      <SectionDivider label={`${label} Plan`} />

      {/* ── Active assignment card ───────────────────────────────────────── */}
      <Card
        style={{ borderTop: `3px solid ${accentColor}` }}
        styles={{ body: STYLES.activeCardBody }}
      >
        {activeAssignment ? (
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="start" size={14}>
                <div style={{ ...STYLES.iconWrapper, background: `${accentColor}18` }}>
                  <Icon style={{ fontSize: 20, color: accentColor }} />
                </div>
                <div>
                  <Space size={8} align="center">
                    <Title level={5} style={STYLES.templateName}>
                      {activeAssignment.templateName}
                    </Title>
                    <Badge
                      status="success"
                      text={<Text style={STYLES.activeBadge}>Active</Text>}
                    />
                  </Space>
                  <Space size={6} style={STYLES.metaRow}>
                    <CalendarOutlined style={STYLES.metaIcon} />
                    <Text type="secondary" style={STYLES.metaText}>
                      Assigned {dayjs(activeAssignment.assignedDate).format('MMM D, YYYY')}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                icon={<SwapOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Change {label}
              </Button>
            </Col>
          </Row>
        ) : (
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center" size={12}>
                <div style={{ ...STYLES.iconWrapper, background: `${colors.textSecondary}12` }}>
                  <Icon style={{ fontSize: 20, color: colors.textSecondary }} />
                </div>
                <div>
                  <Text type="secondary">No {label.toLowerCase()} template assigned.</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Assign {label}
              </Button>
            </Col>
          </Row>
        )}
      </Card>

      {/* ── Assignment history ───────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={STYLES.historySection}>
          <Text style={STYLES.historyLabel}>Assignment History</Text>
          <Table
            dataSource={history}
            columns={historyColumns}
            rowKey="id"
            size="small"
            pagination={false}
            style={STYLES.historyTable}
          />
        </div>
      )}

      {/* ── Assign modal ─────────────────────────────────────────────────── */}
      <AssignModal
        open={modalOpen}
        type={type}
        templates={templates}
        hasActive={!!activeAssignment}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  section: {
    marginTop: 32,
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
  activeCardBody: {
    padding: '20px 24px',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateName: {
    margin: 0,
    fontSize: 16,
  },
  activeBadge: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 600,
  },
  metaRow: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaText: {
    fontSize: 13,
  },
  historySection: {
    marginTop: 16,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textSecondary,
    display: 'block',
    marginBottom: 8,
  },
  historyTable: {
    marginTop: 0,
  },
};

export default AssignmentSection;
