import React from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { selectMetaKPIs } from '../../features/dashboard/metaSelectors';
import { MetaKPICard } from './ExecutiveSummary';

// ─── KPI definitions for the Performance Overview section ─────────────────────
// Intentionally excludes Renewal Rate — kept to 4 focused comparative metrics.
const PERFORMANCE_KPIS = [
  {
    key:     'revenueMoM',
    title:   'Revenue MoM',
    tooltip: 'Paid revenue this period vs. the equivalent prior period.',
  },
  {
    key:     'revenueYoY',
    title:   'Revenue YoY',
    tooltip: 'Paid revenue this period vs. the same window one year ago.',
  },
  {
    key:     'memberGrowth',
    title:   'Member Growth',
    tooltip: 'New members joined this period vs. the prior period.',
  },
  {
    key:     'churnRate',
    title:   'Churn Rate',
    tooltip: 'Members whose plan expired this period ÷ members at period start. Lower is better.',
  },
];

// ─── PerformanceOverview ──────────────────────────────────────────────────────
// Renders four comparative KPI cards in a single balanced row.
// All values computed in selectMetaKPIs — zero calculation here.
const PerformanceOverview = () => {
  const metaKPIs = useSelector(selectMetaKPIs);

  return (
    <Row gutter={[16, 16]}>
      {PERFORMANCE_KPIS.map(({ key, title, tooltip }) => (
        <Col key={key} xs={24} sm={12} md={12} lg={6}>
          <MetaKPICard
            title={title}
            kpi={metaKPIs[key]}
            tooltip={tooltip}
          />
        </Col>
      ))}
    </Row>
  );
};

export default PerformanceOverview;
