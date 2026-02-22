import React from 'react';
import { Card, Row, Col, Select, Button, DatePicker, Typography, Space, Tag, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  setMetric,
  setDimension,
  setChartType,
  setAnalyticsDateRange,
  applyAnalytics,
  resetAnalytics,
} from '../../features/analytics/analyticsSlice';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Dropdown option definitions ──────────────────────────────────────────────
const METRIC_OPTIONS = [
  { value: 'revenue',        label: 'Revenue' },
  { value: 'newMembers',     label: 'New Members' },
  { value: 'activeMembers',  label: 'Active Members' },
  { value: 'pendingAmount',  label: 'Pending Amount' },
  { value: 'attendanceCount',label: 'Attendance Count' },
];

// isTime flag drives chart-type compatibility restrictions
const DIMENSION_OPTIONS = [
  { value: 'month',  label: 'Month',  isTime: true  },
  { value: 'week',   label: 'Week',   isTime: true  },
  { value: 'plan',   label: 'Plan',   isTime: false },
  { value: 'status', label: 'Status', isTime: false },
];

const CHART_TYPE_OPTIONS = [
  { value: 'bar',   label: 'Bar Chart'   },
  { value: 'line',  label: 'Line Chart'  },
  { value: 'donut', label: 'Donut Chart' },
];

// ─── AnalyticsBuilder ─────────────────────────────────────────────────────────
// Manages metric / dimension / chartType selects and an analytics-specific
// date range (written to analyticsSlice, NOT filterSlice).
// Dispatches applyAnalytics() when the user is ready to generate the chart.
const AnalyticsBuilder = () => {
  const dispatch = useDispatch();
  const {
    selectedMetric,
    selectedDimension,
    chartType,
    startDate,
    endDate,
  } = useSelector((state) => state.analytics);

  const isTimeDimension = ['month', 'week'].includes(selectedDimension);
  const isDonut         = chartType === 'donut';

  // Disable donut when a time-based dimension is selected
  const chartTypeOpts = CHART_TYPE_OPTIONS.map((opt) => ({
    ...opt,
    disabled: opt.value === 'donut' && isTimeDimension,
  }));

  // Disable time dimensions when donut is selected
  const dimensionOpts = DIMENSION_OPTIONS.map((opt) => ({
    ...opt,
    disabled: opt.isTime && isDonut,
  }));

  const dateValue =
    startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null;

  const handleDateChange = (dates) => {
    dispatch(
      setAnalyticsDateRange({
        startDate: dates ? dates[0].startOf('day').toISOString() : null,
        endDate:   dates ? dates[1].endOf('day').toISOString()   : null,
      }),
    );
  };

  return (
    <Card
      style={{ marginBottom: 16 }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Row gutter={[12, 12]} align="bottom">
        {/* ── Metric ────────────────────────────────────────────────────────── */}
        <Col xs={24} sm={12} md={5}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Metric</Text>
          </div>
          <Select
            value={selectedMetric}
            onChange={(val) => dispatch(setMetric(val))}
            options={METRIC_OPTIONS}
            style={{ width: '100%' }}
          />
        </Col>

        {/* ── Dimension ─────────────────────────────────────────────────────── */}
        <Col xs={24} sm={12} md={4}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Dimension</Text>
          </div>
          <Select
            value={selectedDimension}
            onChange={(val) => dispatch(setDimension(val))}
            options={dimensionOpts}
            style={{ width: '100%' }}
          />
        </Col>

        {/* ── Chart Type ────────────────────────────────────────────────────── */}
        <Col xs={24} sm={12} md={4}>
          <div style={{ marginBottom: 4 }}>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Chart Type</Text>
              {isDonut && (
                <Tooltip title="Donut charts work best with categorical dimensions (Plan, Status)">
                  <InfoCircleOutlined style={{ fontSize: 11, color: '#6B7280' }} />
                </Tooltip>
              )}
            </Space>
          </div>
          <Select
            value={chartType}
            onChange={(val) => dispatch(setChartType(val))}
            options={chartTypeOpts}
            style={{ width: '100%' }}
          />
        </Col>

        {/* ── Date Range ────────────────────────────────────────────────────── */}
        <Col xs={24} sm={12} md={7}>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Date Range</Text>
          </div>
          <RangePicker
            value={dateValue}
            onChange={handleDateChange}
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date']}
            format="MMM DD, YYYY"
            allowClear
          />
        </Col>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <Col xs={24} sm={24} md={4}>
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => dispatch(applyAnalytics())}
            >
              Apply
            </Button>
            <Tooltip title="Reset to defaults">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(resetAnalytics())}
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* Incompatibility hint — only shown when donut auto-corrected dimension */}
      {isDonut && (
        <div style={{ marginTop: 10 }}>
          <Tag color="geekblue" icon={<InfoCircleOutlined />}>
            Donut requires a categorical dimension (Plan or Status). Time dimensions are disabled.
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsBuilder;
