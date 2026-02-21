import React from 'react';
import { Modal, Descriptions, Tag, Button } from 'antd';
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../../constants/paymentConstants';
import { PLAN_CONFIG } from '../../constants/memberConstants';
import { formatDate } from '../../utils/dateUtils';
import { colors } from '../../theme/theme';

// ─── PaymentViewModal ─────────────────────────────────────────────────────────
// Read-only detail view for a single payment record.
// Props:
//   open    — boolean
//   payment — payment object | null
//   onClose — callback to close
const PaymentViewModal = ({ open, payment, onClose }) => {
  if (!payment) return null;

  const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] ?? {
    label: payment.status,
    color: 'default',
  };
  const methodCfg = PAYMENT_METHOD_CONFIG[payment.method] ?? {
    label: payment.method,
    color: 'default',
  };
  const planCfg = PLAN_CONFIG[payment.planId];

  return (
    <Modal
      title="Payment Details"
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      }
      width={520}
    >
      <Descriptions
        column={2}
        bordered
        size="small"
        style={{ marginTop: 8 }}
        labelStyle={{ fontWeight: 500, background: colors.background }}
      >
        <Descriptions.Item label="Member" span={2}>
          {payment.memberName}
        </Descriptions.Item>

        <Descriptions.Item label="Plan">
          <Tag color={planCfg?.color ?? 'blue'}>{payment.planName}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Amount">
          <span style={{ fontWeight: 600, color: colors.success }}>
            ${Number(payment.amount).toFixed(2)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Method">
          <Tag color={methodCfg.color}>{methodCfg.label}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Payment Date">
          {formatDate(payment.paymentDate)}
        </Descriptions.Item>

        <Descriptions.Item label="Next Due Date">
          {formatDate(payment.nextDueDate)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default PaymentViewModal;
