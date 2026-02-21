import React from 'react';
import { Row, Col, Card, Statistic, Alert, Typography } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Text } = Typography;

const ValidationSummary = () => {
  const validationResult = useSelector((s) => s.import.validationResult);

  const total   = validationResult.length;
  const valid   = validationResult.filter((r) => r.isValid).length;
  const invalid = total - valid;

  if (total === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <Row gutter={16}>
        {/* Total rows */}
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Total Rows"
              value={total}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>

        {/* Valid rows */}
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Valid Rows"
              value={valid}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        {/* Invalid rows */}
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Invalid Rows"
              value={invalid}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: invalid > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Advisory messages */}
      {invalid > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 16, borderRadius: 8 }}
          message={
            <Text>
              <strong>{invalid} row{invalid > 1 ? 's' : ''}</strong> will be skipped during import.
              Hover over the <strong>Invalid</strong> badge in the table to see error details.
            </Text>
          }
        />
      )}

      {valid === 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 8, borderRadius: 8 }}
          message="No valid rows found. Please fix the errors or check your column mapping before importing."
        />
      )}

      {valid > 0 && invalid === 0 && (
        <Alert
          type="success"
          showIcon
          style={{ marginTop: 8, borderRadius: 8 }}
          message="All rows are valid and ready to import."
        />
      )}
    </div>
  );
};

export default ValidationSummary;
