import React from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Typography,
  Tooltip,
  Empty,
  Badge,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { nanoid } from '@reduxjs/toolkit';
import MealCard from './MealCard';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Default meal ─────────────────────────────────────────────────────────────
const newMeal = () => ({
  id:       nanoid(),
  mealName: '',
  foods:    [],
});

// ─── DietDayCard ─────────────────────────────────────────────────────────────
// Fully controlled — all state flows through DietBuilder.
//
// Props:
//   day      : { id, dayName, meals[] }
//   index    : number — 0-based day index
//   onUpdate : (updatedDay) => void
//   onRemove : () => void
const DietDayCard = ({ day, index, onUpdate, onRemove }) => {
  // ── Meal handlers ──────────────────────────────────────────────────────────
  const addMeal = () =>
    onUpdate({ ...day, meals: [...day.meals, newMeal()] });

  const updateMeal = (mealId, updatedMeal) =>
    onUpdate({
      ...day,
      meals: day.meals.map((m) => (m.id === mealId ? updatedMeal : m)),
    });

  const removeMeal = (mealId) =>
    onUpdate({
      ...day,
      meals: day.meals.filter((m) => m.id !== mealId),
    });

  // ── Derived stats for badge ────────────────────────────────────────────────
  const totalFoods = day.meals.reduce((s, m) => s + m.foods.length, 0);

  // ── Card header ───────────────────────────────────────────────────────────
  const cardTitle = (
    <Row align="middle" gutter={12} wrap={false}>
      <Col>
        <Text style={STYLES.dayBadge}>DAY {index + 1}</Text>
      </Col>
      <Col flex="1">
        <Input
          value={day.dayName}
          onChange={(e) => onUpdate({ ...day, dayName: e.target.value })}
          placeholder="e.g. Monday / Rest Day / High-Carb Day"
          variant="borderless"
          style={STYLES.dayNameInput}
        />
      </Col>
      <Col>
        <Space size={6}>
          <Badge
            count={`${day.meals.length} meal${day.meals.length !== 1 ? 's' : ''}`}
            style={STYLES.mealBadge}
          />
          {totalFoods > 0 && (
            <Badge
              count={`${totalFoods} food${totalFoods !== 1 ? 's' : ''}`}
              style={STYLES.foodBadge}
            />
          )}
        </Space>
      </Col>
    </Row>
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
      {day.meals.length > 0 ? (
        day.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onUpdate={(updated) => updateMeal(meal.id, updated)}
            onRemove={() => removeMeal(meal.id)}
          />
        ))
      ) : (
        <Empty
          description="No meals added yet. Click below to add your first meal."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={STYLES.emptyState}
        />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addMeal}
        size="small"
        style={STYLES.addMealBtn}
      >
        Add Meal
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
  },
  mealBadge: {
    backgroundColor: colors.primary,
    fontSize: 11,
  },
  foodBadge: {
    backgroundColor: colors.secondary,
    fontSize: 11,
  },
  emptyState: {
    padding: '20px 0 12px',
  },
  addMealBtn: {
    marginTop: 4,
  },
};

export default DietDayCard;
