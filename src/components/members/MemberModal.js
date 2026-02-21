import React, { useEffect } from 'react';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import MemberForm from '../forms/MemberForm';

// ─── MemberModal ──────────────────────────────────────────────────────────────
// Shared modal for both Add and Edit flows.
// Props:
//   open     — boolean
//   member   — member object (null = Add mode, object = Edit mode)
//   form     — Ant Design form instance from parent
//   onSubmit — callback(values) on valid form submit
//   onCancel — callback to close modal
const MemberModal = ({ open, member, form, onSubmit, onCancel }) => {
  const isEditMode = Boolean(member);

  // Prefill form when switching between add/edit or when modal opens
  useEffect(() => {
    if (!open) return;

    if (isEditMode) {
      form.setFieldsValue({
        name: member.name,
        phone: member.phone,
        email: member.email,
        planId: member.planId,
        joiningDate: dayjs(member.joiningDate),
        duration: Math.max(
          1,
          dayjs(member.expiryDate).diff(dayjs(member.joiningDate), 'month')
        ),
        feeAmount: member.feeAmount,
        status: member.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'active', duration: 1 });
    }
  }, [open, member, isEditMode, form]);

  return (
    <Modal
      title={isEditMode ? 'Edit Member' : 'Add New Member'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText={isEditMode ? 'Save Changes' : 'Add Member'}
      cancelText="Cancel"
      width={680}
      destroyOnClose={false}
      maskClosable={false}
    >
      <MemberForm form={form} onFinish={onSubmit} />
    </Modal>
  );
};

export default MemberModal;
