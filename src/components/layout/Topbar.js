import React from 'react';
import { Layout, Avatar, Typography, Space, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { colors } from '../../theme/theme';

const { Header } = Layout;
const { Title, Text } = Typography;

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: () => {
        dispatch(logout());
        navigate('/login');
      },
    },
  ];

  return (
    <Header
      style={{
        background: colors.cardBg,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        zIndex: 10,
      }}
    >
      <Title level={4} style={{ margin: 0, color: colors.textPrimary }}>
        Gym Management System
      </Title>

      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: colors.primary }}
          />
          {user?.name && (
            <Text style={{ color: colors.textSecondary }}>{user.name}</Text>
          )}
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Topbar;
