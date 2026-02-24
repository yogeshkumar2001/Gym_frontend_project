import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PLAN_CONFIG } from '../constants/memberConstants';

dayjs.extend(customParseFormat);

// ─── Valid plan IDs ────────────────────────────────────────────────────────────
const VALID_PLANS = Object.keys(PLAN_CONFIG);

// ─── Apply column mapping to raw parsed rows ──────────────────────────────────
// Converts CSV-header-keyed rows into system-field-keyed rows.
export const applyMapping = (parsedData, columnMapping) =>
  parsedData.map((row) => ({
    fullName:    columnMapping.fullName    ? (row[columnMapping.fullName]    || '') : '',
    phone:       columnMapping.phone       ? (row[columnMapping.phone]       || '') : '',
    email:       columnMapping.email       ? (row[columnMapping.email]       || '') : '',
    plan:        columnMapping.plan        ? (row[columnMapping.plan]        || 'monthly').toLowerCase() : 'monthly',
    joinDate:    columnMapping.joinDate    ? (row[columnMapping.joinDate]    || '') : '',
    expiryDate:  columnMapping.expiryDate  ? (row[columnMapping.expiryDate]  || '') : '',
    feeAmount:   columnMapping.feeAmount   ? (row[columnMapping.feeAmount]   || '') : '',
    status:      columnMapping.status      ? (row[columnMapping.status]      || 'active') : 'active',
  }));

// ─── Validate a single mapped row ─────────────────────────────────────────────
export const validateRow = (row, index) => {
  const errors = [];

  if (!row.fullName?.trim())
    errors.push('Name is required');

  if (!row.phone?.trim())
    errors.push('Phone is required');

  if (row.joinDate && !dayjs(row.joinDate, 'YYYY-MM-DD', true).isValid())
    errors.push('Invalid date format — expected YYYY-MM-DD');

  if (row.feeAmount && isNaN(parseFloat(row.feeAmount)))
    errors.push('Fee amount must be a number');

  if (row.plan && !VALID_PLANS.includes(row.plan.toLowerCase()))
    errors.push(`Invalid plan — use: ${VALID_PLANS.join(', ')}`);

  return {
    rowIndex: index + 1,
    ...row,
    isValid: errors.length === 0,
    errors,
  };
};

// ─── Validate all mapped rows ──────────────────────────────────────────────────
export const validateAllRows = (mappedData) =>
  mappedData.map((row, index) => validateRow(row, index));

// ─── Build a member record from a validated row ───────────────────────────────
export const buildMemberRecord = (validRow, existingMembersCount) => {
  const planId   = VALID_PLANS.includes(validRow.plan) ? validRow.plan : 'monthly';
  const planCfg  = PLAN_CONFIG[planId];
  const joining  = validRow.joinDate
    ? dayjs(validRow.joinDate).toISOString()
    : dayjs().toISOString();
  const expiry   = validRow.expiryDate
    ? dayjs(validRow.expiryDate).toISOString()
    : dayjs(joining).add(planCfg.months, 'month').toISOString();
  const fee      = parseFloat(validRow.feeAmount) || planCfg.defaultFee;
  const isActive = dayjs().isBefore(dayjs(expiry));

  return {
    id:              Date.now() + existingMembersCount + validRow.rowIndex,
    name:            validRow.fullName.trim(),
    phone:           validRow.phone.trim(),
    email:           validRow.email?.trim() || '',
    planId,
    planName:        planCfg.name,
    joinDate:        joining,
    expiryDate:      expiry,
    status:          isActive ? 'active' : 'expired',
    feeAmount:       fee,
    lastPaymentDate: joining,
  };
};

// ─── Build a payment record from a member record ──────────────────────────────
export const buildPaymentRecord = (member, existingPaymentsCount) => {
  const planCfg   = PLAN_CONFIG[member.planId];
  const nextDue   = dayjs(member.joinDate).add(planCfg.months, 'month').toISOString();

  return {
    id:          Date.now() + existingPaymentsCount + member.id,
    memberId:    member.id,
    memberName:  member.name,
    planId:      member.planId,
    planName:    member.planName,
    amount:      member.feeAmount,
    paymentDate: member.joinDate,
    status:      'paid',
    method:      'cash',
    nextDueDate: nextDue,
  };
};
