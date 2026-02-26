import React from 'react';
import { Button, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { InboxOutlined } from '@ant-design/icons';
import { colors } from '../../theme/theme';

const { Title, Text } = Typography;

/**
 * EmptyState — reusable zero-data placeholder for enterprise SaaS pages.
 *
 * Props:
 *   title                — (string) bold heading
 *   description          — (string, optional) supporting copy
 *   icon                 — (ReactNode, optional) defaults to InboxOutlined
 *   primaryActionLabel   — (string) label for the main CTA button
 *   primaryActionLink    — (string, optional) navigate path; takes precedence if both provided
 *   onPrimaryAction      — (fn, optional) callback when primaryActionLink is absent
 *   secondaryActionLabel — (string, optional) label for a secondary button
 *   secondaryActionLink  — (string, optional) navigate path for secondary action
 *   onSecondaryAction    — (fn, optional) callback when secondaryActionLink is absent
 */
const EmptyState = ({
  title,
  description,
  icon,
  primaryActionLabel,
  primaryActionLink,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionLink,
  onSecondaryAction,
}) => {
  const navigate = useNavigate();

  const handlePrimary = () => {
    if (primaryActionLink) return navigate(primaryActionLink);
    if (onPrimaryAction)   return onPrimaryAction();
  };

  const handleSecondary = () => {
    if (secondaryActionLink) return navigate(secondaryActionLink);
    if (onSecondaryAction)   return onSecondaryAction();
  };

  const hasPrimary   = !!(primaryActionLabel && (primaryActionLink || onPrimaryAction));
  const hasSecondary = !!(secondaryActionLabel && (secondaryActionLink || onSecondaryAction));

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '80px 32px',
        textAlign:      'center',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width:          72,
          height:         72,
          borderRadius:   20,
          background:     'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   24,
          fontSize:       30,
          color:          colors.primary,
          flexShrink:     0,
        }}
      >
        {icon ?? <InboxOutlined />}
      </div>

      {/* Title */}
      <Title
        level={4}
        style={{
          margin:     '0 0 8px',
          fontWeight: 600,
          color:      colors.textPrimary,
          maxWidth:   480,
        }}
      >
        {title}
      </Title>

      {/* Description */}
      {description && (
        <Text
          style={{
            fontSize:    14,
            color:       colors.textSecondary,
            maxWidth:    420,
            display:     'block',
            lineHeight:  '1.65',
            marginBottom: 32,
          }}
        >
          {description}
        </Text>
      )}

      {/* Actions */}
      {(hasPrimary || hasSecondary) && (
        <Space size={12} style={description ? {} : { marginTop: 32 }}>
          {hasPrimary && (
            <Button
              type="primary"
              size="large"
              onClick={handlePrimary}
              style={{ paddingInline: 28, fontWeight: 500 }}
            >
              {primaryActionLabel}
            </Button>
          )}
          {hasSecondary && (
            <Button
              size="large"
              onClick={handleSecondary}
              style={{ paddingInline: 20 }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Space>
      )}
    </div>
  );
};

export default EmptyState;
