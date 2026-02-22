import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  AuditOutlined,
  CloudUploadOutlined,
  BellOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/theme';

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/performance',
    icon: <LineChartOutlined />,
    label: 'Performance',
  },
  {
    key: '/members',
    icon: <TeamOutlined />,
    label: 'Members',
  },
  {
    key: '/payments',
    icon: <DollarOutlined />,
    label: 'Payments',
  },
  {
    key: '/invoices',
    icon: <AuditOutlined />,
    label: 'Invoices',
  },
  {
    key: '/notifications',
    icon: <BellOutlined />,
    label: 'Notifications',
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics',
  },
  {
    key: '/plans',
    icon: <FileTextOutlined />,
    label: 'Plans',
  },
  {
    key: '/upload',
    icon: <CloudUploadOutlined />,
    label: 'Import CSV',
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      style={{
        background: colors.sidebarBg,
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          marginBottom: 8,
        }}
      >
        {!collapsed ? (
          <Text
            strong
            style={{ color: colors.textInverse, fontSize: 18, letterSpacing: 1 }}
          >
            GymPro
          </Text>
        ) : (
          <Text strong style={{ color: colors.primary, fontSize: 20 }}>
            G
          </Text>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ background: colors.sidebarBg, border: 'none' }}
      />
    </Sider>
  );
};

export default Sidebar;
