import React, { useCallback } from 'react';
import {
  Steps, Card, Button, Typography, Space, Row, Col, message,
} from 'antd';
import {
  UploadOutlined, SwapOutlined, EyeOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

// ── Redux ────────────────────────────────────────────────────────────────────
import {
  setCurrentStep, setMappedData, setValidationResult,
  setImportSummary, resetImport,
} from '../features/import/importSlice';
import { addMember } from '../features/members/membersSlice';
import { addPayment } from '../features/payments/paymentsSlice';

// ── Import step components ───────────────────────────────────────────────────
import FileUploadSection    from '../components/import/FileUploadSection';
import ColumnMappingSection from '../components/import/ColumnMappingSection';
import PreviewTable         from '../components/import/PreviewTable';
import ValidationSummary    from '../components/import/ValidationSummary';
import ImportResultSection  from '../components/import/ImportResultSection';

// ── Utils ────────────────────────────────────────────────────────────────────
import { applyMapping, validateAllRows, buildMemberRecord, buildPaymentRecord } from '../utils/importUtils';

const { Title, Text } = Typography;

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { title: 'Upload File',     icon: <UploadOutlined />,  description: 'Select your CSV'    },
  { title: 'Map Columns',     icon: <SwapOutlined />,    description: 'Match to fields'    },
  { title: 'Preview & Validate', icon: <EyeOutlined />, description: 'Review data'        },
  { title: 'Import',          icon: <CheckOutlined />,   description: 'Confirm & import'   },
];

// ─── Import page ──────────────────────────────────────────────────────────────
const Import = () => {
  const dispatch   = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const currentStep    = useSelector((s) => s.import.currentStep);
  const parsedData     = useSelector((s) => s.import.parsedData);
  const columnMapping  = useSelector((s) => s.import.columnMapping);
  const validationResult = useSelector((s) => s.import.validationResult);

  // Members and payments lists (for id generation)
  const membersList   = useSelector((s) => s.members.list);
  const paymentsList  = useSelector((s) => s.payments.list);

  // ── Step navigation ─────────────────────────────────────────────────────────
  const goTo = useCallback((step) => dispatch(setCurrentStep(step)), [dispatch]);

  // ── Step 1 → 2: file has been parsed ────────────────────────────────────────
  const handleFileParsed = () => goTo(1);

  // ── Step 2 → 3: apply mapping and validate ──────────────────────────────────
  const handleApplyMapping = () => {
    const mapped   = applyMapping(parsedData, columnMapping);
    const validated = validateAllRows(mapped);
    dispatch(setMappedData(mapped));
    dispatch(setValidationResult(validated));
    goTo(2);
  };

  // ── Step 3 → 4: execute import ──────────────────────────────────────────────
  const handleImport = () => {
    const validRows = validationResult.filter((r) => r.isValid);

    if (validRows.length === 0) {
      messageApi.error('No valid rows to import. Fix errors and try again.');
      return;
    }

    let successCount = 0;

    validRows.forEach((row, idx) => {
      const member  = buildMemberRecord(row, membersList.length + idx);
      dispatch(addMember(member));

      if (row.feeAmount) {
        const payment = buildPaymentRecord(member, paymentsList.length + idx);
        dispatch(addPayment(payment));
      }

      successCount++;
    });

    const failedCount = validationResult.length - successCount;
    dispatch(setImportSummary({
      total:   validationResult.length,
      success: successCount,
      failed:  failedCount,
    }));

    messageApi.success(`Import completed — ${successCount} member${successCount !== 1 ? 's' : ''} added successfully!`);
    goTo(3);
  };

  // ── Reset everything ─────────────────────────────────────────────────────────
  const handleReset = () => dispatch(resetImport());

  // ── Required mapping check ───────────────────────────────────────────────────
  const requiredMapped = !!(columnMapping.fullName && columnMapping.phone);
  const hasValidRows   = validationResult.some((r) => r.isValid);

  // ── Render active step content ───────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FileUploadSection onParsed={handleFileParsed} />;
      case 1:
        return <ColumnMappingSection />;
      case 2:
        return (
          <>
            <PreviewTable />
            <ValidationSummary />
          </>
        );
      case 3:
        return <ImportResultSection onReset={handleReset} />;
      default:
        return null;
    }
  };

  // ── Bottom navigation buttons ────────────────────────────────────────────────
  const renderNavButtons = () => {
    if (currentStep === 3) return null; // Result screen has its own reset button

    return (
      <Row justify="space-between" style={{ marginTop: 28 }}>
        <Col>
          {currentStep > 0 && (
            <Button onClick={() => goTo(currentStep - 1)}>
              ← Previous
            </Button>
          )}
        </Col>
        <Col>
          {currentStep === 0 && (
            <Text type="secondary">Select and parse a file to continue</Text>
          )}

          {currentStep === 1 && (
            <Button
              type="primary"
              disabled={!requiredMapped || parsedData.length === 0}
              onClick={handleApplyMapping}
            >
              Preview Data →
            </Button>
          )}

          {currentStep === 2 && (
            <Space>
              <Button onClick={() => goTo(1)}>
                ← Back to Mapping
              </Button>
              <Button
                type="primary"
                disabled={!hasValidRows}
                onClick={handleImport}
                style={{ background: hasValidRows ? '#52c41a' : undefined, borderColor: hasValidRows ? '#52c41a' : undefined }}
              >
                Import Data →
              </Button>
            </Space>
          )}
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {contextHolder}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>CSV Import</Title>
        <Text type="secondary">
          Migrate member data from Excel / CSV files. Valid rows are imported into Members &amp; Payments.
        </Text>
      </div>

      {/* ── Stepper ─────────────────────────────────────────────────────────── */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} styles={{ body: { padding: '20px 32px' } }}>
        <Steps
          current={currentStep}
          items={STEPS.map((s) => ({
            title: s.title,
            icon: s.icon,
            description: s.description,
          }))}
          responsive
        />
      </Card>

      {/* ── Active step content ──────────────────────────────────────────────── */}
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '28px 32px' } }}>
        {renderStep()}
        {renderNavButtons()}
      </Card>
    </div>
  );
};

export default Import;
