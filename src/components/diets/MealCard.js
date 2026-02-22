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
import { PlusOutlined, DeleteOutlined, CoffeeOutlined } from '@ant-design/icons';
import { nanoid } from '@reduxjs/toolkit';
import FoodItemRow, { FOOD_COL_WIDTHS } from './FoodItemRow';
import { colors } from '../../theme/theme';

const { Text } = Typography;

// ─── Default food item ────────────────────────────────────────────────────────
const newFood = () => ({
  id:       nanoid(),
  foodName: '',
  quantity: '',
  calories: null,
  protein:  null,
  carbs:    null,
  fats:     null,
  notes:    '',
});

// ─── Food table header — aligned with FoodItemRow via FOOD_COL_WIDTHS ─────────
const FoodHeader = () => (
  <Row gutter={6} wrap={false} style={STYLES.headerRow}>
    <Col style={FOOD_COL_WIDTHS.name}>
      <Text style={STYLES.headerLabel}>Food</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.quantity}>
      <Text style={STYLES.headerLabel}>Quantity</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.calories}>
      <Text style={STYLES.headerLabel}>Kcal</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.protein}>
      <Text style={STYLES.headerLabel}>Protein</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.carbs}>
      <Text style={STYLES.headerLabel}>Carbs</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.fats}>
      <Text style={STYLES.headerLabel}>Fats</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.notes}>
      <Text style={STYLES.headerLabel}>Notes</Text>
    </Col>
    <Col style={FOOD_COL_WIDTHS.actions} />
  </Row>
);

// ─── MealCard ─────────────────────────────────────────────────────────────────
// Fully controlled — builder state lives in DietBuilder via DietDayCard.
//
// Props:
//   meal     : { id, mealName, foods[] }
//   onUpdate : (updatedMeal) => void
//   onRemove : () => void
const MealCard = ({ meal, onUpdate, onRemove }) => {
  // ── Food handlers ──────────────────────────────────────────────────────────
  const addFood = () =>
    onUpdate({ ...meal, foods: [...meal.foods, newFood()] });

  const updateFood = (foodId, updatedFood) =>
    onUpdate({
      ...meal,
      foods: meal.foods.map((f) => (f.id === foodId ? updatedFood : f)),
    });

  const removeFood = (foodId) =>
    onUpdate({
      ...meal,
      foods: meal.foods.filter((f) => f.id !== foodId),
    });

  // ── Card header ───────────────────────────────────────────────────────────
  const cardTitle = (
    <Space size={8} align="center">
      <CoffeeOutlined style={STYLES.mealIcon} />
      <Input
        value={meal.mealName}
        onChange={(e) => onUpdate({ ...meal, mealName: e.target.value })}
        placeholder="e.g. Breakfast"
        variant="borderless"
        style={STYLES.mealNameInput}
      />
    </Space>
  );

  const cardExtra = (
    <Tooltip title="Remove meal">
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
      size="small"
      style={STYLES.card}
      styles={{ body: STYLES.cardBody }}
    >
      {meal.foods.length > 0 ? (
        <>
          {/* Horizontal scroll container — keeps macro columns from wrapping */}
          <div style={STYLES.scrollWrapper}>
            <div style={STYLES.scrollInner}>
              <FoodHeader />
              <Divider style={STYLES.divider} />
              {meal.foods.map((food) => (
                <FoodItemRow
                  key={food.id}
                  food={food}
                  onUpdate={(updated) => updateFood(food.id, updated)}
                  onRemove={() => removeFood(food.id)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <Empty
          description="No food items yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={STYLES.emptyState}
        />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addFood}
        size="small"
        style={STYLES.addFoodBtn}
      >
        Add Food Item
      </Button>
    </Card>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  card: {
    marginBottom: 12,
    borderLeft: `3px solid ${colors.secondary}`,
    background: '#F9FAFB',
  },
  cardBody: {
    padding: '12px 16px',
  },
  mealIcon: {
    color: colors.secondary,
    fontSize: 14,
  },
  mealNameInput: {
    fontWeight: 600,
    fontSize: 14,
    padding: 0,
    minWidth: 180,
    background: 'transparent',
  },
  headerRow: {
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textSecondary,
  },
  divider: {
    margin: '4px 0 8px',
  },
  scrollWrapper: {
    overflowX: 'auto',
  },
  scrollInner: {
    minWidth: 720,
  },
  emptyState: {
    padding: '12px 0 8px',
  },
  addFoodBtn: {
    marginTop: 10,
  },
};

export default MealCard;
