import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import InvoiceForm from '../forms/InvoiceForm';

// ─── InvoiceModal ─────────────────────────────────────────────────────────────
// Wraps InvoiceForm in an Ant Design Modal.
// `open`     — controls visibility
// `onClose`  — called when user cancels
// `onSubmit` — called with raw form values
const InvoiceModal = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title="Generate Invoice"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Generate"
      destroyOnClose
      width={520}
    >
      <InvoiceForm form={form} onFinish={onSubmit} />
    </Modal>
  );
};

export default InvoiceModal;
