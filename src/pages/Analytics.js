import React from 'react';
import {
  Row, Col, Typography, Card, Select, Space, Tag, Statistic, Divider,
} from 'antd';
import {
  BarChartOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setPlan, setStatus } from '../features/filters/filterSlice';
import {
  selectAnalyticsConfig,
  selectAnalyticsResult,
} from '../features/analytics/analyticsSelectors';
import { METRIC_LABELS, DIMENSION_LABELS } from '../features/analytics/analyticsSlice';
import AnalyticsBuilder from '../components/analytics/AnalyticsBuilder';
import DynamicChart from '../components/charts/DynamicChart';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

// ─── Global context filter options ───────────────────────────────────────────
const PLAN_OPTIONS = [
  { value: 'all',       label: 'All Plans'  },
  { value: 'monthly',   label: 'Monthly'    },
  { value: 'quarterly', label: 'Quarterly'  },
  { value: 'annually',  label: 'Annually'   },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Status' },
  { value: 'active',   label: 'Active'     },
  { value: 'expired',  label: 'Expired'    },
  { value: 'inactive', label: 'Inactive'   },
];

// ─── Value formatters ─────────────────────────────────────────────────────────
const formatTotal = (result) => {
  if (result.isCurrency) {
    return `$${result.total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return result.total.toLocaleString();
};

const formatMax = (result) => {
  if (result.isCurrency) {
    return `$${result.max.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return result.max.toLocaleString();
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = () => {
  const dispatch  = useDispatch();
  const config    = useSelector(selectAnalyticsConfig);
  const result    = useSelector(selectAnalyticsResult);
  const { plan, status } = useSelector((state) => state.filters);

  const chartTitle =
    config.isGenerated
      ? `${METRIC_LABELS[config.selectedMetric]} by ${DIMENSION_LABELS[config.selectedDimension]}`
      : 'Analytics Chart';

  const hasData = result.isReady && result.data.length > 0;

  return (
    <div>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space align="center">
            <BarChartOutlined style={{ fontSize: 22, color: colors.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Analytics Builder</Title>
              <Text type="secondary">
                Explore key metrics across dimensions with dynamic chart visualizations.
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Tag color="purple">Beta</Tag>
        </Col>
      </Row>

      {/* ── Global context filters (plan + status from filterSlice) ───────── */}
      <Card
        size="small"
        style={{ marginBottom: 12 }}
        styles={{ body: { padding: '10px 16px' } }}
      >
        <Row gutter={[12, 8]} align="middle" wrap={false}>
          <Col flex="none">
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              Global Context:
            </Text>
          </Col>

          <Col flex="none">
            <Select
              size="small"
              value={plan}
              onChange={(val) => dispatch(setPlan(val))}
              options={PLAN_OPTIONS}
              style={{ width: 140 }}
            />
          </Col>

          <Col flex="none">
            <Select
              size="small"
              value={status}
              onChange={(val) => dispatch(setStatus(val))}
              options={STATUS_OPTIONS}
              style={{ width: 150 }}
            />
          </Col>

          <Col flex="auto">
            <Text type="secondary" style={{ fontSize: 11 }}>
              Plan &amp; status filters apply to all analytics computations
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ── Builder panel — metric / dimension / chartType / date range ────── */}
      <AnalyticsBuilder />

      {/* ── Summary stats row (only when data is ready) ───────────────────── */}
      {hasData && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            <Col xs={8} sm={6} md={4}>
              <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                <Statistic
                  title="Data Points"
                  value={result.dataPoints}
                  valueStyle={{ fontSize: 20, color: colors.primary }}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4}>
              <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                <Statistic
                  title="Total"
                  value={formatTotal(result)}
                  valueStyle={{ fontSize: 20, color: colors.success }}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4}>
              <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
                <Statistic
                  title="Peak Value"
                  value={formatMax(result)}
                  valueStyle={{ fontSize: 20, color: colors.warning }}
                />
              </Card>
            </Col>
          </Row>
          <Divider style={{ margin: '0 0 12px' }} />
        </>
      )}

      {/* ── Chart card ────────────────────────────────────────────────────── */}
      <Card
        title={
          <Space>
            <BarChartOutlined style={{ color: colors.primary }} />
            <span>{chartTitle}</span>
          </Space>
        }
        extra={
          hasData ? (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {result.dataPoints} group{result.dataPoints !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
        styles={{ body: { padding: hasData ? '16px 20px' : 0 } }}
      >
        {/* ── Before Apply state ───────────────────────────────────────────── */}
        {!result.isReady && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <ThunderboltOutlined
              style={{ fontSize: 44, color: colors.textSecondary, marginBottom: 16 }}
            />
            <div>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Configure the options above and click{' '}
                <Text strong>Apply</Text> to generate your chart.
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Choose a metric, group by a dimension, pick a chart type, and set your date range.
              </Text>
            </div>
          </div>
        )}

        {/* ── Attendance stub state ────────────────────────────────────────── */}
        {result.isReady && result.isAttendanceStub && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <DatabaseOutlined
              style={{ fontSize: 44, color: colors.textSecondary, marginBottom: 16 }}
            />
            <div>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Attendance data is not yet connected.
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                This metric will be available once the attendance module is integrated.
              </Text>
            </div>
          </div>
        )}

        {/* ── Chart (or empty state via DynamicChart) ──────────────────────── */}
        {result.isReady && !result.isAttendanceStub && (
          <DynamicChart
            chartType={config.chartType}
            data={result.data}
            isCurrency={result.isCurrency}
          />
        )}
      </Card>
    </div>
  );
};

export default Analytics;
