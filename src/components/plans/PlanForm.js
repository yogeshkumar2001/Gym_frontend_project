import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
];

// ─── PlanForm ─────────────────────────────────────────────────────────────────
// Controlled modal form for creating and editing plans.
//
// Props:
//   open         boolean          — controls modal visibility
//   initialValues object|null     — pre-fill for edit mode; null = create mode
//   onSubmit     (values) => void — called with validated form data
//   onCancel     () => void       — called on modal close / Cancel button
//   confirmLoading boolean        — shows OK button spinner while submitting
const PlanForm = ({ open, initialValues, onSubmit, onCancel, confirmLoading }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  // Sync form fields whenever the modal opens or initial values change
  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialValues ?? {
          name: '',
          description: '',
          durationMonths: 1,
          price: '',
          status: 'active',
        }
      );
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? 'Edit Plan' : 'New Plan'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEdit ? 'Save Changes' : 'Create Plan'}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        style={{ marginTop: 8 }}
      >
        <Form.Item
          name="name"
          label="Plan Name"
          rules={[{ required: true, message: 'Plan name is required' }]}
        >
          <Input placeholder="e.g. Premium Monthly" maxLength={60} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            placeholder="Brief description of what this plan includes"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="durationMonths"
              label="Duration (months)"
              rules={[{ required: true, message: 'Duration is required' }]}
            >
              <InputNumber
                min={1}
                max={60}
                style={{ width: '100%' }}
                placeholder="e.g. 1"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[
                { required: true, message: 'Price is required' },
                {
                  type: 'number',
                  min: 0.01,
                  message: 'Price must be greater than 0',
                },
              ]}
            >
              <InputNumber
                min={0.01}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                prefix="$"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlanForm;
