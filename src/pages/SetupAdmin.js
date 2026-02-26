import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert, Button, Card, Divider, Form, Input, Typography,
} from 'antd';
import {
  LockOutlined, MailOutlined, ShopOutlined, UserOutlined,
} from '@ant-design/icons';
import { setupAdminThunk } from '../features/auth/authSlice';
import { colors } from '../theme/theme';

const { Title, Text, Paragraph } = Typography;

const SetupAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, firstTimeSetup } = useSelector((s) => s.auth);

  // Guard: run before any conditional returns so hooks order is stable
  useEffect(() => {
    if (isAuthenticated) { navigate('/',      { replace: true }); return; }
    if (!firstTimeSetup)  { navigate('/login', { replace: true }); }
  }, [isAuthenticated, firstTimeSetup, navigate]);

  // Render nothing while the effect above is about to redirect
  if (isAuthenticated || !firstTimeSetup) return null;

  const onFinish = async (values) => {
    try {
      await dispatch(
        setupAdminThunk({
          gymName:   values.gymName,
          ownerName: values.ownerName,
          email:     values.email,
          password:  values.password,
        })
      ).unwrap();
      navigate('/');
    } catch (err) {
      // If the backend says setup is already done, the DB has a user —
      // redirect to login so they can sign in with existing credentials.
      if (typeof err === 'string' && err.includes('already completed')) {
        navigate('/login', { replace: true });
      }
      // Other errors are shown via state.auth.error Alert below
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.sidebarBg} 0%, ${colors.secondary} 100%)`,
        padding: '24px 16px',
      }}
    >
      <Card style={{ width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Text strong style={{ color: '#fff', fontSize: 22 }}>G</Text>
          </div>
          <Title level={3} style={{ margin: 0, color: colors.textPrimary }}>
            Welcome to GymPro
          </Title>
          <Paragraph
            type="secondary"
            style={{ marginTop: 6, marginBottom: 0 }}
          >
            Let's set up your gym. This only takes a minute.
          </Paragraph>
        </div>

        <Divider />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          scrollToFirstError
        >
          {/* Gym Info */}
          <Form.Item
            name="gymName"
            label="Gym Name"
            rules={[{ required: true, message: 'Please enter your gym name' }]}
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="e.g. Iron House Fitness"
              size="large"
            />
          </Form.Item>

          {/* Owner */}
          <Form.Item
            name="ownerName"
            label="Your Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="e.g. Ravi Sharma"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="admin@yourgym.com"
              size="large"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please set a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Min. 8 characters"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Re-enter password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Create Admin Account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SetupAdmin;
