import React from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { colors } from '../../theme/theme';

const { Content } = AntLayout;

const Layout = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />

      <AntLayout>
        <Topbar />

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colors.background,
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
