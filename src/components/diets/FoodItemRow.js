import React from 'react';
import { Row, Col, Input, InputNumber, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// ─── Column widths ────────────────────────────────────────────────────────────
// Exported so MealCard can build an aligned header row using the same values.
// The total minimum content width is ~720px; the parent wraps in a scroll div.
export const FOOD_COL_WIDTHS = {
  name:     { flex: '1 1 150px', minWidth: 150 },
  quantity: { width: 90 },
  calories: { width: 70 },
  protein:  { width: 70 },
  carbs:    { width: 70 },
  fats:     { width: 70 },
  notes:    { flex: '1 1 100px', minWidth: 100 },
  actions:  { width: 36, flexShrink: 0 },
};

// ─── FoodItemRow ──────────────────────────────────────────────────────────────
// Fully controlled — all state lives in MealCard (and up to DietBuilder).
//
// Props:
//   food     : { id, foodName, quantity, calories, protein, carbs, fats, notes }
//   onUpdate : (updatedFood) => void
//   onRemove : () => void
const FoodItemRow = ({ food, onUpdate, onRemove }) => {
  const set = (field, value) => onUpdate({ ...food, [field]: value });

  return (
    <Row gutter={6} align="middle" wrap={false} style={ROW_STYLE}>
      <Col style={FOOD_COL_WIDTHS.name}>
        <Input
          value={food.foodName}
          onChange={(e) => set('foodName', e.target.value)}
          placeholder="Food name"
          size="small"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.quantity}>
        <Input
          value={food.quantity}
          onChange={(e) => set('quantity', e.target.value)}
          placeholder="100g / 1 bowl"
          size="small"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.calories}>
        <InputNumber
          value={food.calories}
          onChange={(v) => set('calories', v)}
          min={0}
          size="small"
          style={FULL_WIDTH}
          placeholder="kcal"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.protein}>
        <InputNumber
          value={food.protein}
          onChange={(v) => set('protein', v)}
          min={0}
          size="small"
          style={FULL_WIDTH}
          placeholder="g"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.carbs}>
        <InputNumber
          value={food.carbs}
          onChange={(v) => set('carbs', v)}
          min={0}
          size="small"
          style={FULL_WIDTH}
          placeholder="g"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.fats}>
        <InputNumber
          value={food.fats}
          onChange={(v) => set('fats', v)}
          min={0}
          size="small"
          style={FULL_WIDTH}
          placeholder="g"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.notes}>
        <Input
          value={food.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Notes"
          size="small"
        />
      </Col>
      <Col style={FOOD_COL_WIDTHS.actions}>
        <Tooltip title="Remove food item">
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

export default FoodItemRow;
