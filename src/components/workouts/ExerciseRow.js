import React from 'react';
import { Row, Col, Input, InputNumber, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// ─── Column widths — must match EXERCISE_HEADER in WorkoutDayCard ─────────────
export const COL_WIDTHS = {
  name:    { flex: '1 1 180px' },
  sets:    { width: 68 },
  reps:    { width: 68 },
  rest:    { width: 80 },
  notes:   { flex: '1 1 140px' },
  actions: { width: 36, flexShrink: 0 },
};

// ─── ExerciseRow ──────────────────────────────────────────────────────────────
// Fully controlled — all state lives in the parent (WorkoutDayCard / builder).
//
// Props:
//   exercise : { id, exerciseName, sets, reps, restSeconds, notes }
//   onUpdate : (updatedExercise) => void
//   onRemove : () => void
const ExerciseRow = ({ exercise, onUpdate, onRemove }) => {
  const set = (field, value) => onUpdate({ ...exercise, [field]: value });

  return (
    <Row gutter={8} align="middle" wrap={false} style={ROW_STYLE}>
      <Col style={COL_WIDTHS.name}>
        <Input
          value={exercise.exerciseName}
          onChange={(e) => set('exerciseName', e.target.value)}
          placeholder="Exercise name"
          size="small"
        />
      </Col>
      <Col style={COL_WIDTHS.sets}>
        <InputNumber
          value={exercise.sets}
          onChange={(v) => set('sets', v)}
          min={1}
          max={99}
          size="small"
          style={FULL_WIDTH}
          placeholder="3"
        />
      </Col>
      <Col style={COL_WIDTHS.reps}>
        <InputNumber
          value={exercise.reps}
          onChange={(v) => set('reps', v)}
          min={1}
          max={999}
          size="small"
          style={FULL_WIDTH}
          placeholder="10"
        />
      </Col>
      <Col style={COL_WIDTHS.rest}>
        <InputNumber
          value={exercise.restSeconds}
          onChange={(v) => set('restSeconds', v)}
          min={0}
          max={600}
          size="small"
          style={FULL_WIDTH}
          placeholder="60"
        />
      </Col>
      <Col style={COL_WIDTHS.notes}>
        <Input
          value={exercise.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Optional note"
          size="small"
        />
      </Col>
      <Col style={COL_WIDTHS.actions}>
        <Tooltip title="Remove exercise">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            size="small"
          />
        </Tooltip>
      </Col>
    </Row>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const ROW_STYLE  = { marginBottom: 6 };
const FULL_WIDTH = { width: '100%' };

export default ExerciseRow;
