import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { LockIcon } from '../icons/CustomIcons';
import { useTheme } from '../../design/theme';

interface RoomCodeBadgeProps {
  roomId: string;
  isPrivate?: boolean;
}

export const RoomCodeBadge: React.FC<RoomCodeBadgeProps> = ({ roomId, isPrivate = false }) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.borderSubtle,
        },
      ]}
    >
      <View
        style={[
          styles.topBevel,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.5)',
          },
        ]}
      />
      <Text style={[styles.label, { color: theme.textMuted }]}>Room code</Text>
      <View style={styles.row}>
        <Text style={[styles.code, { color: theme.accentHazel, fontFamily: TYPOGRAPHY.monoFamily }]}>
          {roomId}
        </Text>
        {isPrivate && <LockIcon size={14} color={theme.accentHazel} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: SPACING.sm, // 8px
    paddingHorizontal: SPACING.md, // 12px
    borderRadius: RADIUS.control, // 12px
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: SPACING.xs, // 4px
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs, // 4px
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
