import React from 'react';
import { Form, Select, InputNumber, DatePicker, Row, Col, Typography } from 'antd';
import {
  FORM_PAYMENT_STATUS_OPTIONS,
  FORM_PAYMENT_METHOD_OPTIONS,
} from '../../constants/paymentConstants';

const { Option } = Select;
const { Text } = Typography;

// ─── PaymentForm ──────────────────────────────────────────────────────────────
// Reusable form for recording a payment.
// Receives:
//   form    — Ant Design form instance from parent
//   onFinish — callback(values) triggered on valid submit
//   members — array from membersSlice (for member dropdown)
const PaymentForm = ({ form, onFinish, members }) => {
  // Auto-fill amount from the selected member's plan fee
  const handleMemberChange = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      form.setFieldsValue({ amount: member.feeAmount });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      scrollToFirstError
    >
      <Row gutter={16}>
        {/* Member — full width, searchable */}
        <Col xs={24}>
          <Form.Item
            name="memberId"
            label="Member"
            rules={[{ required: true, message: 'Please select a member' }]}
          >
            <Select
              showSearch
              placeholder="Search and select member"
              optionFilterProp="label"
              onChange={handleMemberChange}
              options={members.map((m) => ({
                value: m.id,
                label: `${m.name} — ${m.planName}`,
              }))}
            />
          </Form.Item>
        </Col>

        {/* Amount */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="amount"
            label="Amount ($)"
            rules={[{ required: true, message: 'Amount is required' }]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Auto-filled from member plan. Adjust for partial payments.
              </Text>
            }
          >
            <InputNumber
              min={0}
              precision={2}
              prefix="$"
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        {/* Payment Date */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            rules={[{ required: true, message: 'Payment date is required' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="MMM DD, YYYY"
              disabledDate={(d) => d && d.isAfter(new Date())}
            />
          </Form.Item>
        </Col>

        {/* Payment Method */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true, message: 'Payment method is required' }]}
          >
            <Select placeholder="Select method">
              {FORM_PAYMENT_METHOD_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Status */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label="Payment Status"
            rules={[{ required: true, message: 'Status is required' }]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Full payment extends member expiry date automatically.
              </Text>
            }
          >
            <Select placeholder="Select status">
              {FORM_PAYMENT_STATUS_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PaymentForm;
