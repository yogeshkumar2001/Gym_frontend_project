import React, { useEffect } from 'react';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import PaymentForm from '../forms/PaymentForm';

// ─── PaymentModal ─────────────────────────────────────────────────────────────
// Modal for recording a new payment.
// Props:
//   open     — boolean
//   form     — Ant Design form instance from parent
//   members  — full members list from Redux
//   onSubmit — callback(values) on valid form submit
//   onCancel — callback to close modal
const PaymentModal = ({ open, form, members, onSubmit, onCancel }) => {
  // Reset form and set sensible defaults every time modal opens
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      paymentDate: dayjs(),
      status: 'paid',
      method: 'cash',
    });
  }, [open, form]);

  return (
    <Modal
      title="Record Payment"
      open={open}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText="Record Payment"
      cancelText="Cancel"
      width={620}
      destroyOnClose={false}
      maskClosable={false}
    >
      <PaymentForm form={form} onFinish={onSubmit} members={members} />
    </Modal>
  );
};

export default PaymentModal;
