import React from 'react';
import {
  Row, Col, Card, Statistic, Table, Tag, Typography, Button,
  Alert, Space, Divider,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  TrophyOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { resetImport } from '../../features/import/importSlice';
import { message } from 'antd';

const { Text, Title } = Typography;

const ImportResultSection = ({ onReset }) => {
  const dispatch       = useDispatch();
  const importSummary  = useSelector((s) => s.import.importSummary);
  const validationResult = useSelector((s) => s.import.validationResult);

  const failedRows = validationResult.filter((r) => !r.isValid);

  // ── Failed rows table columns ────────────────────────────────────────────────
  const failedColumns = [
    {
      title: 'Row #',
      dataIndex: 'rowIndex',
      width: 70,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      render: (v) => <Text>{v || '(missing)'}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (v) => <Text>{v || '(missing)'}</Text>,
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      render: (errors) => (
        <Space wrap>
          {errors.map((e, i) => (
            <Tag key={i} color="error" style={{ borderRadius: 6 }}>{e}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  // ── Mock CSV download ────────────────────────────────────────────────────────
  const handleDownloadFailed = () => {
    message.info('In production, this would download a CSV of failed rows.');
  };

  const handleStartOver = () => {
    dispatch(resetImport());
    onReset?.();
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Success banner */}
      <Alert
        type={importSummary.failed === 0 ? 'success' : 'warning'}
        showIcon
        style={{ marginBottom: 20, borderRadius: 10 }}
        message={
          importSummary.failed === 0
            ? `All ${importSummary.success} members imported successfully!`
            : `Import completed — ${importSummary.success} succeeded, ${importSummary.failed} failed.`
        }
      />

      {/* Summary stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Total Processed"
              value={importSummary.total}
              prefix={<TrophyOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Imported Successfully"
              value={importSummary.success}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: '20px 24px' } }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Failed / Skipped"
              value={importSummary.failed}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: importSummary.failed > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* What was imported */}
      <Card style={{ marginBottom: 20, borderRadius: 10 }} styles={{ body: { padding: '16px 24px' } }}>
        <Title level={5} style={{ margin: '0 0 8px' }}>What was imported</Title>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#595959' }}>
          <li>
            <Text>
              <strong>{importSummary.success}</strong> new member record{importSummary.success !== 1 ? 's' : ''} added to Members
            </Text>
          </li>
          <li>
            <Text>
              <strong>{importSummary.success}</strong> initial payment record{importSummary.success !== 1 ? 's' : ''} added to Payments
            </Text>
          </li>
          <li>
            <Text type="secondary">Dashboard metrics and filters will reflect imported data automatically.</Text>
          </li>
        </ul>
      </Card>

      {/* Failed rows detail */}
      {failedRows.length > 0 && (
        <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '16px 24px' } }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Failed Rows ({failedRows.length})
              </Title>
            </Col>
            <Col>
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={handleDownloadFailed}
              >
                Download Failed Rows
              </Button>
            </Col>
          </Row>

          <Table
            dataSource={failedRows}
            columns={failedColumns}
            rowKey="rowIndex"
            pagination={false}
            size="small"
            scroll={{ x: 560 }}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </Card>
      )}

      <Divider />

      {/* Reset / start over */}
      <div style={{ textAlign: 'center' }}>
        <Button
          icon={<ReloadOutlined />}
          type="primary"
          onClick={handleStartOver}
        >
          Start a New Import
        </Button>
      </div>
    </div>
  );
};

export default ImportResultSection;
