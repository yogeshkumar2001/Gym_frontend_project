import React, { useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Typography, Alert } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

// ─── AssignModal ──────────────────────────────────────────────────────────────
// Shared modal for assigning a Workout or Diet template to a member.
// Replacing an existing active assignment is clearly communicated via the
// info alert so the admin understands history will be preserved.
//
// Props:
//   open         : boolean
//   type         : 'workout' | 'diet'
//   templates    : { id, name, status }[]  — from workoutsSlice / dietsSlice
//   hasActive    : boolean  — true if member already has an active assignment
//   onSubmit     : (templateId, templateName, assignedDate: ISO) => void
//   onCancel     : () => void
const AssignModal = ({ open, type, templates, hasActive, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const label = type === 'workout' ? 'Workout' : 'Diet';

  // Pre-fill assigned date to today whenever the modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ assignedDate: dayjs() });
    }
  }, [open, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const template = templates.find((t) => t.id === values.templateId);
      onSubmit(
        values.templateId,
        template?.name ?? 'Unknown Template',
        values.assignedDate.toISOString(),
      );
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
    title: t.status === 'draft' ? `${t.name} (Draft)` : t.name,
  }));

  return (
    <Modal
      title={`Assign ${label} Template`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Assign"
      width={480}
      destroyOnClose
    >
      {hasActive && (
        <Alert
          type="info"
          showIcon
          message="Existing assignment will be marked completed and moved to history."
          style={STYLES.alert}
        />
      )}

      {templates.length === 0 && (
        <Alert
          type="warning"
          showIcon
          message={`No ${label.toLowerCase()} templates available. Create one first.`}
          style={STYLES.alert}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        style={STYLES.form}
      >
        <Form.Item
          name="templateId"
          label={`${label} Template`}
          rules={[{ required: true, message: 'Please select a template' }]}
        >
          <Select
            options={templateOptions}
            placeholder={`Search and select a ${label.toLowerCase()} template`}
            showSearch
            optionFilterProp="label"
            disabled={templates.length === 0}
          />
        </Form.Item>

        <Form.Item
          name="assignedDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select a start date' }]}
        >
          <DatePicker style={STYLES.fullWidth} />
        </Form.Item>

        <Text type="secondary" style={STYLES.hint}>
          The assigned date marks when this template begins for the member.
        </Text>
      </Form>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  alert: {
    marginBottom: 16,
  },
  form: {
    marginTop: 8,
  },
  fullWidth: {
    width: '100%',
  },
  hint: {
    fontSize: 12,
  },
};

export default AssignModal;
