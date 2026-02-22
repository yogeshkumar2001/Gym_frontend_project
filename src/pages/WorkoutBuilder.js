import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  Breadcrumb,
  Empty,
  message,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { addTemplate, updateTemplate } from '../features/workouts/workoutsSlice';
import { selectAllTemplates } from '../features/workouts/workoutsSelectors';
import WorkoutDayCard from '../components/workouts/WorkoutDayCard';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_OPTIONS = [
  { value: 'beginner',     label: 'Beginner'     },
  { value: 'intermediate', label: 'Intermediate'  },
  { value: 'advanced',     label: 'Advanced'      },
];

const STATUS_OPTIONS = [
  { value: 'draft',  label: 'Draft'  },
  { value: 'active', label: 'Active' },
];

const EMPTY_DRAFT = () => ({
  name:        '',
  description: '',
  difficulty:  'beginner',
  status:      'draft',
  days:        [],
});

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <Divider orientation="left" style={STYLES.divider}>
    <Text style={STYLES.dividerLabel}>{label}</Text>
  </Divider>
);

// ─── Field label ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <Text style={STYLES.fieldLabel}>
    {children}
    {required && <span style={STYLES.requiredMark}> *</span>}
  </Text>
);

// ─── WorkoutBuilder ───────────────────────────────────────────────────────────
// Full-page builder for creating and editing workout templates.
// Routes: /workouts/new  |  /workouts/edit/:id
//
// All draft state is local — dispatched to Redux only on Save.
// Zero business logic in this component: day/exercise mutations live in
// WorkoutDayCard and ExerciseRow respectively.
const WorkoutBuilder = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const templates      = useSelector(selectAllTemplates);
  const existingTemplate = id ? templates.find((t) => t.id === id) : null;
  const isEdit         = !!existingTemplate;

  // ── Local draft state ──────────────────────────────────────────────────────
  const [draft, setDraft] = useState(() =>
    existingTemplate ? { ...existingTemplate } : EMPTY_DRAFT()
  );
  const [nameError, setNameError] = useState(false);

  // Sync draft when navigating to an existing template
  useEffect(() => {
    if (existingTemplate) setDraft({ ...existingTemplate });
  }, [existingTemplate?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Info field updater ─────────────────────────────────────────────────────
  const updateInfo = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') setNameError(!value.trim());
  };

  // ── Day handlers ───────────────────────────────────────────────────────────
  const addDay = () =>
    setDraft((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id:        nanoid(),
          dayName:   `Day ${prev.days.length + 1}`,
          exercises: [],
        },
      ],
    }));

  const updateDay = (dayId, updatedDay) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? updatedDay : d)),
    }));

  const removeDay = (dayId) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.filter((d) => d.id !== dayId),
    }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!draft.name.trim()) {
      setNameError(true);
      messageApi.error('Template name is required.');
      return;
    }

    if (isEdit) {
      dispatch(updateTemplate(draft));
      messageApi.success(`"${draft.name}" updated.`);
    } else {
      dispatch(
        addTemplate({
          ...draft,
          id:        nanoid(),
          createdAt: dayjs().toISOString(),
        })
      );
      messageApi.success(`"${draft.name}" created.`);
    }

    setTimeout(() => navigate('/workouts'), 500);
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const totalExercises = draft.days.reduce(
    (sum, d) => sum + d.exercises.length,
    0
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={STYLES.page}>
      {contextHolder}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={STYLES.header}>
        <Col>
          <Breadcrumb
            items={[
              {
                title: (
                  <span
                    style={STYLES.breadcrumbLink}
                    onClick={() => navigate('/workouts')}
                  >
                    Workouts
                  </span>
                ),
              },
              { title: isEdit ? 'Edit Template' : 'New Template' },
            ]}
            style={STYLES.breadcrumb}
          />
          <Space align="center" size={10}>
            <ThunderboltOutlined style={STYLES.titleIcon} />
            <div>
              <Title level={3} style={STYLES.title}>
                {isEdit ? `Edit: ${existingTemplate.name || 'Untitled'}` : 'Create Workout Template'}
              </Title>
              <Text type="secondary">
                {draft.days.length} day{draft.days.length !== 1 ? 's' : ''} · {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            <Button onClick={() => navigate('/workouts')}>Cancel</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              {isEdit ? 'Save Changes' : 'Save Template'}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* ── Section 1: Template Info ─────────────────────────────────────── */}
      <Card styles={{ body: STYLES.cardBody }}>
        <SectionDivider label="Template Information" />

        <Row gutter={[16, 16]}>
          {/* Name */}
          <Col xs={24} md={12}>
            <FieldLabel required>Template Name</FieldLabel>
            <Input
              value={draft.name}
              onChange={(e) => updateInfo('name', e.target.value)}
              placeholder="e.g. Beginner Full Body Program"
              size="large"
              status={nameError ? 'error' : ''}
            />
            {nameError && (
              <Text style={STYLES.errorText}>Template name is required.</Text>
            )}
          </Col>

          {/* Difficulty */}
          <Col xs={12} md={6}>
            <FieldLabel>Difficulty</FieldLabel>
            <Select
              value={draft.difficulty}
              onChange={(v) => updateInfo('difficulty', v)}
              options={DIFFICULTY_OPTIONS}
              size="large"
              style={STYLES.fullWidth}
            />
          </Col>

          {/* Status */}
          <Col xs={12} md={6}>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={draft.status}
              onChange={(v) => updateInfo('status', v)}
              options={STATUS_OPTIONS}
              size="large"
              style={STYLES.fullWidth}
            />
          </Col>

          {/* Description */}
          <Col xs={24}>
            <FieldLabel>Description</FieldLabel>
            <TextArea
              value={draft.description}
              onChange={(e) => updateInfo('description', e.target.value)}
              placeholder="Describe the goal, target audience, and structure of this program"
              rows={3}
              maxLength={400}
              showCount
            />
          </Col>
        </Row>
      </Card>

      {/* ── Section 2: Workout Days ──────────────────────────────────────── */}
      <div style={STYLES.daysSection}>
        <SectionDivider
          label={`Workout Days${draft.days.length ? ` (${draft.days.length})` : ''}`}
        />

        {draft.days.length === 0 && (
          <Card styles={{ body: STYLES.emptyCardBody }}>
            <Empty
              description="No workout days added yet. Click below to add your first day."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}

        {draft.days.map((day, idx) => (
          <WorkoutDayCard
            key={day.id}
            day={day}
            index={idx}
            onUpdate={(updated) => updateDay(day.id, updated)}
            onRemove={() => removeDay(day.id)}
          />
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addDay}
          size="large"
          block
          style={STYLES.addDayBtn}
        >
          Add Workout Day
        </Button>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  page: {
    maxWidth: 1100,
  },
  header: {
    marginBottom: 24,
  },
  breadcrumb: {
    marginBottom: 8,
  },
  breadcrumbLink: {
    cursor: 'pointer',
    color: colors.primary,
  },
  titleIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    margin: 0,
    lineHeight: 1.3,
  },
  cardBody: {
    padding: '20px 24px',
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textSecondary,
    display: 'block',
    marginBottom: 6,
  },
  requiredMark: {
    color: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    display: 'block',
    marginTop: 4,
  },
  fullWidth: {
    width: '100%',
  },
  daysSection: {
    marginTop: 24,
  },
  emptyCardBody: {
    padding: '32px 24px',
  },
  addDayBtn: {
    marginTop: 8,
  },
};

export default WorkoutBuilder;
