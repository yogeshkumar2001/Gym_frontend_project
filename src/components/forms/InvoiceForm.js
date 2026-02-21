import React from 'react';
import { Form, Select, DatePicker, InputNumber } from 'antd';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// ─── InvoiceForm ───────────────────────────────────────────────────────────────
// Fields: member (→ auto-fills plan + amount), amount, issueDate, dueDate.
// Receives `form` instance and `onFinish` from parent modal.
const InvoiceForm = ({ form, onFinish }) => {
  const members = useSelector((state) => state.members.list);

  const handleMemberChange = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      form.setFieldsValue({
        planId: member.planId,
        planName: member.planName,
        memberName: member.name,
        memberEmail: member.email,
        memberPhone: member.phone,
        amount: member.feeAmount,
      });
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Hidden fields auto-filled on member select */}
      <Form.Item name="planId" hidden><input /></Form.Item>
      <Form.Item name="planName" hidden><input /></Form.Item>
      <Form.Item name="memberName" hidden><input /></Form.Item>
      <Form.Item name="memberEmail" hidden><input /></Form.Item>
      <Form.Item name="memberPhone" hidden><input /></Form.Item>

      <Form.Item
        name="memberId"
        label="Member"
        rules={[{ required: true, message: 'Select a member' }]}
      >
        <Select
          showSearch
          placeholder="Search member by name or plan..."
          optionFilterProp="label"
          onChange={handleMemberChange}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.name} — ${m.planName}`,
          }))}
        />
      </Form.Item>

      <Form.Item
        name="amount"
        label="Amount ($)"
        rules={[{ required: true, message: 'Enter amount' }]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: '100%' }}
          prefix="$"
          placeholder="Auto-filled from plan"
        />
      </Form.Item>

      <Form.Item
        name="issueDate"
        label="Issue Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: 'Select issue date' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          disabledDate={(d) => d && d.isAfter(dayjs())}
        />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label="Due Date"
        rules={[{ required: true, message: 'Select due date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
};

export default InvoiceForm;
