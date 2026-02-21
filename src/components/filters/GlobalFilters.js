import React from 'react';
import { Row, Col, Input, Select, Button, Card } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setStatus,
  setPlan,
  setSearch,
  resetFilters,
} from '../../features/filters/filterSlice';
import DateRangePicker from './DateRangePicker';

const { Option } = Select;

// ─── Default options (Members context) ───────────────────────────────────────
const DEFAULT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
];

const PLAN_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

// ─── GlobalFilters ────────────────────────────────────────────────────────────
// Props:
//   statusOptions     — override status dropdown options per page context
//   searchPlaceholder — override search placeholder text
//   showPlanFilter    — hide plan dropdown when not relevant (default: true)
const GlobalFilters = ({
  statusOptions = DEFAULT_STATUS_OPTIONS,
  searchPlaceholder = 'Search name, email, phone...',
  showPlanFilter = true,
}) => {
  const dispatch = useDispatch();
  const { status, plan, search } = useSelector((state) => state.filters);

  return (
    <Card
      size="small"
      style={{ marginBottom: 24 }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <Row gutter={[12, 12]} align="middle">
        {/* Date Range */}
        <Col xs={24} sm={24} md={showPlanFilter ? 7 : 9} lg={showPlanFilter ? 6 : 8}>
          <DateRangePicker />
        </Col>

        {/* Status Filter */}
        <Col xs={12} sm={8} md={4} lg={4}>
          <Select
            value={status}
            onChange={(val) => dispatch(setStatus(val))}
            style={{ width: '100%' }}
            placeholder="Status"
          >
            {statusOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Plan Filter (optional) */}
        {showPlanFilter && (
          <Col xs={12} sm={8} md={4} lg={4}>
            <Select
              value={plan}
              onChange={(val) => dispatch(setPlan(val))}
              style={{ width: '100%' }}
              placeholder="Plan"
            >
              {PLAN_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {/* Search */}
        <Col xs={24} sm={24} md={showPlanFilter ? 6 : 8} lg={showPlanFilter ? 7 : 9}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            allowClear
          />
        </Col>

        {/* Reset */}
        <Col xs={24} sm={8} md={3} lg={3}>
          <Button
            icon={<ClearOutlined />}
            onClick={() => dispatch(resetFilters())}
            style={{ width: '100%' }}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default GlobalFilters;
