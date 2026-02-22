import React from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Descriptions,
  Space,
  Breadcrumb,
  Button,
  Result,
  Avatar,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {
  assignWorkoutToMember,
  assignDietToMember,
} from '../features/members/membersSlice';
import {
  selectMemberById,
  selectActiveWorkout,
  selectWorkoutHistory,
  selectActiveDiet,
  selectDietHistory,
} from '../features/members/assignmentSelectors';
import { selectAllTemplates }        from '../features/workouts/workoutsSelectors';
import { selectAllDietTemplates }    from '../features/diets/dietsSelectors';
import AssignmentSection             from '../components/members/AssignmentSection';
import { PLAN_CONFIG, STATUS_CONFIG } from '../constants/memberConstants';
import { colors }                    from '../theme/theme';

const { Title, Text } = Typography;

// ─── MemberProfile ────────────────────────────────────────────────────────────
// Displays a member's basic info, active workout + diet assignments, and
// full assignment history. Accessible via /members/:id.
//
// Assignment dispatch pattern:
//   - newId and completedAt are generated here (at call-site) so reducers stay pure.
//   - templateName is denormalized into the assignment record so history is
//     preserved even if the template is later renamed or deleted.
const MemberProfile = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const member          = useSelector((state) => selectMemberById(state, id));
  const activeWorkout   = useSelector((state) => selectActiveWorkout(state, id));
  const workoutHistory  = useSelector((state) => selectWorkoutHistory(state, id));
  const activeDiet      = useSelector((state) => selectActiveDiet(state, id));
  const dietHistory     = useSelector((state) => selectDietHistory(state, id));
  const workoutTemplates = useSelector(selectAllTemplates);
  const dietTemplates    = useSelector(selectAllDietTemplates);

  // ── 404 guard ──────────────────────────────────────────────────────────────
  if (!member) {
    return (
      <Result
        status="404"
        title="Member not found"
        subTitle="The member you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/members')}>
            Back to Members
          </Button>
        }
      />
    );
  }

  // ── Assignment handlers ────────────────────────────────────────────────────
  const handleAssignWorkout = (templateId, templateName, assignedDate) => {
    dispatch(
      assignWorkoutToMember({
        memberId:     member.id,
        templateId,
        templateName,
        assignedDate,
        newId:        nanoid(),
        completedAt:  dayjs().toISOString(),
      })
    );
    messageApi.success(`Workout template "${templateName}" assigned.`);
  };

  const handleAssignDiet = (templateId, templateName, assignedDate) => {
    dispatch(
      assignDietToMember({
        memberId:     member.id,
        templateId,
        templateName,
        assignedDate,
        newId:        nanoid(),
        completedAt:  dayjs().toISOString(),
      })
    );
    messageApi.success(`Diet template "${templateName}" assigned.`);
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const planCfg   = PLAN_CONFIG[member.planId]   ?? {};
  const statusCfg = STATUS_CONFIG[member.status] ?? { label: member.status, color: 'default' };
  const initials  = member.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={STYLES.page}>
      {contextHolder}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Row justify="space-between" align="middle" style={STYLES.header}>
        <Col>
          <Breadcrumb
            items={[
              {
                title: (
                  <span
                    style={STYLES.breadcrumbLink}
                    onClick={() => navigate('/members')}
                  >
                    Members
                  </span>
                ),
              },
              { title: member.name },
            ]}
            style={STYLES.breadcrumb}
          />
          <Space align="center" size={12}>
            <Avatar
              size={48}
              style={STYLES.avatar}
            >
              {initials}
            </Avatar>
            <div>
              <Title level={3} style={STYLES.memberName}>
                {member.name}
              </Title>
              <Space size={8}>
                <Tag color={planCfg.color ?? 'blue'}>{member.planName}</Tag>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/members')}
          >
            Back to Members
          </Button>
        </Col>
      </Row>

      {/* ── Section 1: Basic Information ─────────────────────────────────── */}
      <Card styles={{ body: STYLES.cardBody }}>
        <Text style={STYLES.sectionLabel}>Basic Information</Text>

        <Descriptions
          bordered={false}
          column={{ xs: 1, sm: 2, md: 3 }}
          style={STYLES.descriptions}
          labelStyle={STYLES.descLabel}
          contentStyle={STYLES.descContent}
        >
          <Descriptions.Item label="Email">
            {member.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {member.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Member ID">
            #{member.id}
          </Descriptions.Item>
          <Descriptions.Item label="Plan">
            <Tag color={planCfg.color ?? 'blue'}>{member.planName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fee">
            ${Number(member.feeAmount).toFixed(2)} / period
          </Descriptions.Item>
          <Descriptions.Item label="Joined">
            {dayjs(member.joiningDate).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Expires">
            <Text
              style={{
                color: dayjs(member.expiryDate).isBefore(dayjs())
                  ? colors.error
                  : colors.success,
                fontWeight: 500,
              }}
            >
              {dayjs(member.expiryDate).format('MMM D, YYYY')}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Last Payment">
            {member.lastPaymentDate
              ? dayjs(member.lastPaymentDate).format('MMM D, YYYY')
              : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ── Section 2: Workout Assignment ────────────────────────────────── */}
      <AssignmentSection
        type="workout"
        activeAssignment={activeWorkout}
        history={workoutHistory}
        templates={workoutTemplates}
        onAssign={handleAssignWorkout}
      />

      {/* ── Section 3: Diet Assignment ───────────────────────────────────── */}
      <AssignmentSection
        type="diet"
        activeAssignment={activeDiet}
        history={dietHistory}
        templates={dietTemplates}
        onAssign={handleAssignDiet}
      />
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = {
  page: {
    maxWidth: 1000,
  },
  header: {
    marginBottom: 24,
  },
  breadcrumb: {
    marginBottom: 10,
  },
  breadcrumbLink: {
    cursor: 'pointer',
    color: colors.primary,
  },
  avatar: {
    background: colors.primary,
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0,
  },
  memberName: {
    margin: 0,
    lineHeight: 1.3,
  },
  cardBody: {
    padding: '20px 24px',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: colors.textSecondary,
    display: 'block',
    marginBottom: 16,
  },
  descriptions: {
    marginTop: 0,
  },
  descLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
  },
  descContent: {
    fontSize: 14,
  },
};

export default MemberProfile;
