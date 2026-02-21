import dayjs from 'dayjs';
import { PLAN_CONFIG } from '../constants/memberConstants';

// ─── Name Pool ────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry',
  'Isabella', 'James', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Patrick',
  'Quinn', 'Rachel', 'Samuel', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zachary', 'Aria', 'Blake', 'Chloe', 'Dylan', 'Elena', 'Finn',
  'Gina', 'Hunter', 'Ivy', 'Jack', 'Kylie', 'Logan', 'Maya', 'Nathan',
  'Opal', 'Peyton', 'Rose', 'Sean', 'Taylor', 'Ursula', 'Vera', 'Will',
  'Xena', 'Zoe',
];

const LAST_NAMES = [
  'Johnson', 'Martinez', 'White', 'Lee', 'Brown', 'Davis', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker',
  'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner',
  'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
  'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy',
];

// ─── Plan Cycle ───────────────────────────────────────────────────────────────
const PLAN_CYCLE = [
  { id: 'monthly', ...PLAN_CONFIG.monthly },
  { id: 'quarterly', ...PLAN_CONFIG.quarterly },
  { id: 'annually', ...PLAN_CONFIG.annually },
];

const METHODS = ['cash', 'upi', 'card'];

// ─── Member Generator ─────────────────────────────────────────────────────────
const generateMembers = () =>
  Array.from({ length: 50 }, (_, i) => {
    const plan = PLAN_CYCLE[i % 3];
    const daysAgo = (i + 1) * 7;
    const joiningDate = dayjs().subtract(daysAgo, 'day');
    const expiryDate = joiningDate.add(plan.months, 'month');
    const isExpired = expiryDate.isBefore(dayjs());

    let status;
    if (i % 8 === 0) status = 'inactive';
    else if (isExpired) status = 'expired';
    else status = 'active';

    return {
      id: i + 1,
      name: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`,
      phone: `555-${String(1000 + i).slice(1)}`,
      email: `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@example.com`,
      planId: plan.id,
      planName: plan.name,
      joiningDate: joiningDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status,
      feeAmount: plan.defaultFee,
      lastPaymentDate: joiningDate.toISOString(),
    };
  });

export const seedMembers = generateMembers();

// ─── Payment Generator ────────────────────────────────────────────────────────
// Generates exactly 100 payments: 2 per member.
//   Payment 1 — initial joining payment (always 'paid')
//   Payment 2 — renewal payment (status varies by index)
const generatePayments = () => {
  const payments = [];
  let id = 1;

  seedMembers.forEach((member, mi) => {
    const plan = PLAN_CONFIG[member.planId];

    // ── Initial joining payment ──────────────────────────────────────────────
    payments.push({
      id: id++,
      memberId: member.id,
      memberName: member.name,
      planId: member.planId,
      planName: member.planName,
      amount: member.feeAmount,
      paymentDate: member.joiningDate,
      status: 'paid',
      method: METHODS[mi % 3],
      nextDueDate: member.expiryDate,
    });

    // ── Renewal payment (due at expiry) ──────────────────────────────────────
    // Status distribution: ~40% paid, ~30% partial, ~30% due
    let renewalStatus;
    if (mi % 5 === 0) renewalStatus = 'due';
    else if (mi % 5 === 1) renewalStatus = 'partial';
    else renewalStatus = 'paid';

    const renewalAmount =
      renewalStatus === 'partial'
        ? +(member.feeAmount * 0.5).toFixed(2)
        : member.feeAmount;

    const renewalDate = dayjs(member.expiryDate);
    const nextDueAfterRenewal = renewalDate.add(plan.months, 'month');

    payments.push({
      id: id++,
      memberId: member.id,
      memberName: member.name,
      planId: member.planId,
      planName: member.planName,
      amount: renewalAmount,
      paymentDate: renewalDate.toISOString(),
      status: renewalStatus,
      method: METHODS[(mi + 1) % 3],
      nextDueDate: nextDueAfterRenewal.toISOString(),
    });
  });

  return payments;
};

export const seedPayments = generatePayments();

// ─── Invoice Generator ────────────────────────────────────────────────────────
// 50 invoices — one per member.
//   i%6 < 4  → paid   (paymentId = initial payment, which is always 'paid')
//   i%6 === 4 → overdue (paymentId null, dueDate in the past)
//   i%6 === 5 → unpaid  (paymentId null, dueDate in the future)
const generateInvoices = () =>
  seedMembers.map((member, i) => {
    const isLinked = i % 6 < 4;
    const isOverdue = i % 6 === 4;

    const issueDate = member.joiningDate;
    let dueDate;
    if (isOverdue) {
      // joiningDate + 30 days — guaranteed past for members who joined > 30 days ago
      dueDate = dayjs(member.joiningDate).add(30, 'day').toISOString();
    } else if (!isLinked) {
      // future → unpaid
      dueDate = dayjs().add(14 + (i % 4) * 7, 'day').toISOString();
    } else {
      dueDate = member.expiryDate;
    }

    return {
      id: i + 1,
      invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
      memberPhone: member.phone,
      planId: member.planId,
      planName: member.planName,
      amount: member.feeAmount,
      issueDate,
      dueDate,
      // initial payment id for member index i = i*2+1 (always 'paid')
      paymentId: isLinked ? i * 2 + 1 : null,
    };
  });

export const seedInvoices = generateInvoices();

// ─── Plans ────────────────────────────────────────────────────────────────────
export const seedPlans = [
  { id: 'monthly', name: 'Monthly', duration: 30, price: 49.99 },
  { id: 'quarterly', name: 'Quarterly', duration: 90, price: 129.99 },
  { id: 'annually', name: 'Annually', duration: 365, price: 449.99 },
];

// ─── Dashboard Chart Data ─────────────────────────────────────────────────────
export const seedChartData = [
  { month: 'Aug', members: 28, revenue: 1200 },
  { month: 'Sep', members: 35, revenue: 1550 },
  { month: 'Oct', members: 42, revenue: 1900 },
  { month: 'Nov', members: 38, revenue: 1700 },
  { month: 'Dec', members: 50, revenue: 2300 },
  { month: 'Jan', members: 63, revenue: 2800 },
];
