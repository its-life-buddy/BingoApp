import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SPACING, TOUCH_TARGET, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { ChevronIcon } from '../icons/CustomIcons';

export interface SettingsRowProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isDestructive?: boolean;
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * SettingsRow: Clean Mobile Row Architecture
 * Inspired by WhatsApp and Apple iOS Settings standards:
 * Title + Supporting descriptive subtitle + Affordance / Chevron.
 * Strictly avoids decorative circular app-launcher tiles.
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  description,
  icon,
  rightElement,
  onPress,
  isDestructive = false,
  showDivider = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const titleColor = isDestructive
    ? COLORS.dangerRed
    : theme.textPrimary;

  const content = (
    <View
      style={[
        styles.rowContainer,
        showDivider && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 },
        style,
      ]}
      testID={testID}
    >
      {/* Optional contextual semantic icon (restrained, non-decorative) */}
      {icon && <View style={styles.iconWrap}>{icon}</View>}

      {/* Text Group: Title + Supporting Description */}
      <View style={styles.textGroup}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Right Affordance or Chevron */}
      <View style={styles.rightWrap}>
        {rightElement ? (
          rightElement
        ) : onPress ? (
          <ChevronIcon direction="right" size={16} color={theme.textMuted} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}${description ? `, ${description}` : ''}`}
        hitSlop={TOUCH_TARGET.hitSlop}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md, // 12px
    minHeight: 56,
  },
  iconWrap: {
    marginRight: SPACING.md, // 12px
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  textGroup: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  rightWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
