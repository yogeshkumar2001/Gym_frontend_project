import React from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { colors } from '../theme/theme';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    dispatch(loginStart());
    // Mock auth — replace with real API call later
    setTimeout(() => {
      if (values.email && values.password) {
        dispatch(loginSuccess({ email: values.email, name: 'Admin' }));
        navigate('/');
      } else {
        dispatch(loginFailure('Invalid credentials'));
      }
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.sidebarBg} 0%, ${colors.secondary} 100%)`,
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
            <Text strong style={{ color: '#fff', fontSize: 22 }}>
              G
            </Text>
          </div>
          <Title level={3} style={{ margin: 0, color: colors.textPrimary }}>
            GymPro
          </Title>
          <Text type="secondary">Sign in to your admin panel</Text>
        </div>

        <Divider />

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@gym.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
