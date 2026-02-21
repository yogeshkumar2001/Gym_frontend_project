import React from 'react';
import {
  Card, Row, Col, Select, Typography, Tag, Space, Divider, Alert,
} from 'antd';
import {
  CheckCircleOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setColumnMapping,
  MOCK_CSV_HEADERS,
  SYSTEM_FIELDS,
} from '../../features/import/importSlice';

const { Text, Title } = Typography;

// Dropdown options: includes a blank "— Not mapped —" option
const csvHeaderOptions = [
  { value: '', label: '— Not mapped —' },
  ...MOCK_CSV_HEADERS.map((h) => ({ value: h, label: h })),
];

const ColumnMappingSection = () => {
  const dispatch       = useDispatch();
  const columnMapping  = useSelector((s) => s.import.columnMapping);

  const handleChange = (systemKey, csvHeader) => {
    dispatch(setColumnMapping({ ...columnMapping, [systemKey]: csvHeader }));
  };

  const mappedCount  = Object.values(columnMapping).filter(Boolean).length;
  const requiredKeys = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.key);
  const allRequired  = requiredKeys.every((k) => columnMapping[k]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Map CSV Columns to System Fields
            </Title>
            <Text type="secondary">
              Match the columns from your CSV file to the corresponding member fields.
            </Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{MOCK_CSV_HEADERS.length} CSV columns detected</Tag>
              <Tag color={allRequired ? 'green' : 'orange'}>
                {mappedCount} / {SYSTEM_FIELDS.length} mapped
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {!allRequired && (
        <Alert
          type="warning"
          showIcon
          message="Required fields (Full Name, Phone) must be mapped before proceeding."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Detected CSV headers chip row */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '12px 20px' } }}>
        <Text strong style={{ marginRight: 12 }}>Detected CSV headers:</Text>
        <Space wrap>
          {MOCK_CSV_HEADERS.map((h) => (
            <Tag key={h} color="geekblue" style={{ borderRadius: 6 }}>{h}</Tag>
          ))}
        </Space>
      </Card>

      {/* Mapping table */}
      <Card styles={{ body: { padding: 0 } }}>
        {/* Column header */}
        <Row
          style={{
            padding: '10px 24px',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Col span={10}>
            <Text strong style={{ fontSize: 13, color: '#595959' }}>System Field</Text>
          </Col>
          <Col span={2} />
          <Col span={12}>
            <Text strong style={{ fontSize: 13, color: '#595959' }}>CSV Column</Text>
          </Col>
        </Row>

        {SYSTEM_FIELDS.map((field, idx) => {
          const mapped = !!columnMapping[field.key];
          return (
            <React.Fragment key={field.key}>
              <Row
                align="middle"
                style={{
                  padding: '14px 24px',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                {/* System field label */}
                <Col span={10}>
                  <Space>
                    {mapped
                      ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                      : <MinusCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                    }
                    <Text style={{ fontWeight: 500 }}>{field.label}</Text>
                    {field.required && (
                      <Tag color="red" style={{ fontSize: 11, lineHeight: '18px' }}>Required</Tag>
                    )}
                  </Space>
                </Col>

                {/* Arrow */}
                <Col span={2} style={{ textAlign: 'center', color: '#bfbfbf', fontSize: 18 }}>
                  →
                </Col>

                {/* CSV column dropdown */}
                <Col span={12}>
                  <Select
                    style={{ width: '100%' }}
                    value={columnMapping[field.key] || ''}
                    options={csvHeaderOptions}
                    onChange={(val) => handleChange(field.key, val)}
                    placeholder="— Not mapped —"
                    allowClear
                    onClear={() => handleChange(field.key, '')}
                  />
                </Col>
              </Row>
              {idx < SYSTEM_FIELDS.length - 1 && <Divider style={{ margin: 0 }} />}
            </React.Fragment>
          );
        })}
      </Card>
    </div>
  );
};

export default ColumnMappingSection;
