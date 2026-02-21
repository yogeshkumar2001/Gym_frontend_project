import React, { useRef, useState } from 'react';
import {
  Card, Button, Typography, Progress, Space, Alert,
} from 'antd';
import {
  CloudUploadOutlined, FileTextOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFileName, setParsedData, setLoading, MOCK_CSV_ROWS,
} from '../../features/import/importSlice';

const { Text, Title } = Typography;

const FileUploadSection = ({ onParsed }) => {
  const dispatch  = useDispatch();
  const fileName  = useSelector((s) => s.import.fileName);
  const loading   = useSelector((s) => s.import.loading);

  const [progress,     setProgress]     = useState(0);
  const [parseStatus,  setParseStatus]  = useState('idle'); // idle | parsing | done
  const fileInputRef = useRef(null);

  // ── Handle file selection ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    dispatch(setFileName(file.name));
    setParseStatus('idle');
    setProgress(0);
  };

  // ── Simulate CSV parsing ───────────────────────────────────────────────────
  const handleParse = () => {
    if (!fileName) return;
    setParseStatus('parsing');
    setProgress(0);
    dispatch(setLoading(true));

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 18) + 8;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setParseStatus('done');
        dispatch(setLoading(false));
        dispatch(setParsedData(MOCK_CSV_ROWS));
        setTimeout(() => onParsed(), 600);
      } else {
        setProgress(current);
      }
    }, 150);
  };

  return (
    <Card
      style={{ maxWidth: 600, margin: '0 auto' }}
      styles={{ body: { padding: 40 } }}
    >
      {/* Drop zone UI */}
      <div
        style={{
          border: '2px dashed #d9d9d9',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          background: fileName ? '#f6ffed' : '#fafafa',
          borderColor: fileName ? '#52c41a' : '#d9d9d9',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => !parseStatus === 'parsing' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {fileName ? (
          <Space direction="vertical" align="center" size={12}>
            <FileTextOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
              {fileName}
            </Title>
            <Text type="secondary">File selected — ready to parse</Text>
          </Space>
        ) : (
          <Space direction="vertical" align="center" size={12}>
            <CloudUploadOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
            <Title level={5} style={{ margin: 0, color: '#595959' }}>
              Click to select a CSV file
            </Title>
            <Text type="secondary">Supports .csv files exported from Excel / Google Sheets</Text>
          </Space>
        )}
      </div>

      {/* Select / Change button */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{ marginRight: 8 }}
        >
          {fileName ? 'Change File' : 'Browse File'}
        </Button>

        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          disabled={!fileName || loading}
          loading={loading}
          onClick={handleParse}
        >
          {loading ? 'Parsing…' : 'Upload & Parse'}
        </Button>
      </div>

      {/* Progress bar */}
      {parseStatus !== 'idle' && (
        <div style={{ marginTop: 24 }}>
          <Progress
            percent={progress}
            status={parseStatus === 'done' ? 'success' : 'active'}
            strokeColor={parseStatus === 'done' ? '#52c41a' : '#1677ff'}
          />
          {parseStatus === 'done' && (
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              message={`Parsed ${MOCK_CSV_ROWS.length} rows successfully`}
              style={{ marginTop: 12, borderRadius: 8 }}
            />
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Alert
          type="info"
          showIcon
          message="Demo mode: any .csv file will be parsed with sample gym data for preview."
          style={{ borderRadius: 8 }}
        />
      </div>
    </Card>
  );
};

export default FileUploadSection;
