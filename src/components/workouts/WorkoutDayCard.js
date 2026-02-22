import React from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  Tooltip,
  Empty,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { nanoid } from '@reduxjs/toolkit';
import ExerciseRow, { COL_WIDTHS } from './ExerciseRow';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Default exercise — always created with sensible defaults ─────────────────
const newExercise = () => ({
  id:           nanoid(),
  exerciseName: '',
  sets:         3,
  reps:         10,
  restSeconds:  60,
  notes:        '',
});

// ─── Exercise table header — column labels aligned to ExerciseRow COL_WIDTHS ──
const ExerciseHeader = () => (
  <Row gutter={8} wrap={false} style={STYLES.headerRow}>
    <Col style={COL_WIDTHS.name}>
      <Text style={STYLES.headerLabel}>Exercise</Text>
    </Col>
    <Col style={COL_WIDTHS.sets}>
      <Text style={STYLES.headerLabel}>Sets</Text>
    </Col>
    <Col style={COL_WIDTHS.reps}>
      <Text style={STYLES.headerLabel}>Reps</Text>
    </Col>
    <Col style={COL_WIDTHS.rest}>
      <Text style={STYLES.headerLabel}>Rest (s)</Text>
    </Col>
    <Col style={COL_WIDTHS.notes}>
      <Text style={STYLES.headerLabel}>Notes</Text>
    </Col>
    <Col style={COL_WIDTHS.actions} />
  </Row>
);

// ─── WorkoutDayCard ───────────────────────────────────────────────────────────
// Fully controlled — builder state lives in WorkoutBuilder.
//
// Props:
//   day     : { id, dayName, exercises[] }
//   index   : number — 0-based day index (shown as "Day 1", "Day 2", …)
//   onUpdate: (updatedDay) => void
//   onRemove: () => void
const WorkoutDayCard = ({ day, index, onUpdate, onRemove }) => {
  // ── Exercise handlers ──────────────────────────────────────────────────────
  const addExercise = () =>
    onUpdate({ ...day, exercises: [...day.exercises, newExercise()] });

  const updateExercise = (exId, updatedEx) =>
    onUpdate({
      ...day,
      exercises: day.exercises.map((e) => (e.id === exId ? updatedEx : e)),
    });

  const removeExercise = (exId) =>
    onUpdate({
      ...day,
      exercises: day.exercises.filter((e) => e.id !== exId),
    });

  // ── Card header ───────────────────────────────────────────────────────────
  const cardTitle = (
    <Space size={10} align="center">
      <Text style={STYLES.dayBadge}>DAY {index + 1}</Text>
      <Input
        value={day.dayName}
        onChange={(e) => onUpdate({ ...day, dayName: e.target.value })}
        placeholder="e.g. Chest + Triceps"
        variant="borderless"
        style={STYLES.dayNameInput}
      />
    </Space>
  );

  const cardExtra = (
    <Tooltip title="Remove day">
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
        size="small"
      />
    </Tooltip>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card
      title={cardTitle}
      extra={cardExtra}
      style={STYLES.card}
      styles={{ body: STYLES.cardBody }}
    >
      {day.exercises.length > 0 ? (
        <>
          <ExerciseHeader />
          <Divider style={STYLES.divider} />
          {day.exercises.map((ex) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              onUpdate={(updated) => updateExercise(ex.id, updated)}
              onRemove={() => removeExercise(ex.id)}
            />
          ))}
        </>
      ) : (
        <Empty
          description="No exercises yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={STYLES.emptyExercises}
        />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addExercise}
        size="small"
        style={STYLES.addExerciseBtn}
      >
        Add Exercise
      </Button>
    </Card>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  card: {
    marginBottom: 16,
    borderTop: `3px solid ${colors.primary}`,
  },
  cardBody: {
    padding: '16px 20px',
  },
  dayBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap',
  },
  dayNameInput: {
    fontWeight: 600,
    fontSize: 15,
    padding: 0,
    minWidth: 200,
  },
  headerRow: {
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textSecondary,
  },
  divider: {
    margin: '4px 0 10px',
  },
  emptyExercises: {
    padding: '16px 0 8px',
  },
  addExerciseBtn: {
    marginTop: 12,
  },
};

export default WorkoutDayCard;
