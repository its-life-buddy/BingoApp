import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RADIUS, TOUCH_TARGET } from '../../design/tokens';
import { useTheme } from '../../design/theme';

export type IconButtonVariant = 'default' | 'filled' | 'tinted' | 'destructive' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: ((props: { size: number; color: string }) => React.ReactNode) | React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  activeColor?: string;
}

const SIZE_MAP: Record<IconButtonSize, { box: number; icon: number }> = {
  sm: { box: 32, icon: 14 },
  md: { box: 40, icon: 18 },
  lg: { box: 48, icon: 22 },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
  activeColor,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const dims = SIZE_MAP[size];

  const getColors = () => {
    if (disabled) {
      return {
        bg: theme.bgSubtle,
        border: theme.borderSubtle,
        iconColor: theme.textMuted,
      };
    }

    switch (variant) {
      case 'filled':
        return {
          bg: activeColor || theme.accentOlive,
          border: 'transparent',
          iconColor: '#000000',
        };
      case 'tinted':
        return {
          bg: theme.accentOliveTint,
          border: theme.accentOlive,
          iconColor: activeColor || theme.textPrimary,
        };
      case 'destructive':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)',
          iconColor: '#EF4444',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          iconColor: activeColor || theme.textSecondary,
        };
      case 'default':
      default:
        return {
          bg: theme.bgCard,
          border: isFocused ? theme.accentOlive : theme.borderSubtle,
          iconColor: activeColor || theme.textPrimary,
        };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hitSlop={TOUCH_TARGET.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator testID="icon-button-loading" size="small" color={colors.iconColor} />
      ) : typeof icon === 'function' ? (
        icon({ size: dims.icon, color: colors.iconColor })
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});
