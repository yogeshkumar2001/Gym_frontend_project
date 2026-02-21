import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
} from 'antd';
import { FORM_PLAN_OPTIONS, FORM_STATUS_OPTIONS } from '../../constants/memberConstants';

const { Option } = Select;

// ─── MemberForm ───────────────────────────────────────────────────────────────
// Reusable form used for both Add and Edit flows.
// Receives:
//   form       — Ant Design form instance (created by parent via Form.useForm())
//   onFinish   — callback(values) triggered on valid submit
const MemberForm = ({ form, onFinish }) => {
  // When plan changes, auto-fill duration and fee for convenience
  const handlePlanChange = (planId) => {
    const option = FORM_PLAN_OPTIONS.find((p) => p.value === planId);
    if (option) {
      form.setFieldsValue({
        duration: option.months,
        feeAmount: option.defaultFee,
      });
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
        {/* Full Name */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="e.g. Jane Smith" />
          </Form.Item>
        </Col>

        {/* Phone */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone number is required' }]}
          >
            <Input placeholder="e.g. 555-0199" />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input placeholder="jane@example.com" />
          </Form.Item>
        </Col>

        {/* Plan */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="planId"
            label="Plan"
            rules={[{ required: true, message: 'Please select a plan' }]}
          >
            <Select placeholder="Select plan" onChange={handlePlanChange}>
              {FORM_PLAN_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Joining Date */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="joiningDate"
            label="Joining Date"
            rules={[{ required: true, message: 'Joining date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} format="MMM DD, YYYY" />
          </Form.Item>
        </Col>

        {/* Duration */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="duration"
            label="Duration (months)"
            rules={[{ required: true, message: 'Duration is required' }]}
          >
            <InputNumber
              min={1}
              max={24}
              style={{ width: '100%' }}
              placeholder="e.g. 3"
            />
          </Form.Item>
        </Col>

        {/* Fee Amount */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="feeAmount"
            label="Fee Amount ($)"
            rules={[{ required: true, message: 'Fee amount is required' }]}
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

        {/* Status */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              {FORM_STATUS_OPTIONS.map((opt) => (
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

export default MemberForm;
