import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { RankIcon, SunIcon, MoonIcon, VolumeIcon } from '../icons/CustomIcons';
import { IconButton } from '../shared/IconButton';

export interface PlayerHeaderProps {
  playerName: string;
  rating: number;
  tier?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenSettings?: () => void;
  testID?: string;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  playerName,
  rating,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  tier = 'Platinum',
  soundEnabled = true,
  onToggleSound,
  testID,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.floatingSurface,
        {
          backgroundColor: theme.bgCard,
          borderColor: isDark ? theme.borderSubtle : 'rgba(255, 122, 0, 0.15)',
        },
      ]}
      testID={testID}
    >
      {/* Hairline Specular Bevel */}
      <View style={styles.bevel} />

      {/* Left Identity Group: Avatar with live presence ring + Name + Points */}
      <View style={styles.identityGroup}>
        <View
          style={[
            styles.avatarSphere,
            {
              backgroundColor: theme.bgRecessed,
              borderColor: COLORS.winterHazel,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
            {playerName.slice(0, 2).toUpperCase()}
          </Text>
          <View style={[styles.presencePip, { borderColor: theme.bgCard }]} />
        </View>

        <View style={styles.textStack}>
          <Text style={[styles.usernameText, { color: theme.textPrimary }]} numberOfLines={1}>
            {playerName}
          </Text>
          <View style={styles.scoreRow}>
            <RankIcon size={12} color={COLORS.winterHazel} style={{ marginRight: 3 }} />
            <Text style={[styles.ratingNumber, { color: theme.textPrimary }]}>
              {rating.toLocaleString()}
            </Text>
            <Text style={[styles.pointsTag, { color: theme.textMuted }]}>PTS</Text>
          </View>
        </View>
      </View>

      {/* Right Control Group: Rebuilt using unified ThreeUI IconButton */}
      <View style={styles.controlCluster}>
        <IconButton
          icon={({ size }) => (
            <VolumeIcon
              size={size}
              color={soundEnabled ? COLORS.primaryOrange : '#8E94A0'}
              muted={!soundEnabled}
            />
          )}
          onPress={onToggleSound}
          accessibilityLabel={soundEnabled ? 'Mute game sound' : 'Enable game sound'}
          size="md"
          variant="default"
        />

        <IconButton
// eslint-disable-next-line @typescript-eslint/no-unused-vars
          icon={({ size, color }) => (
            isDark ? (
              <SunIcon size={size} color={COLORS.winterHazel} />
            ) : (
              <MoonIcon size={size} color={COLORS.lunarShadow} />
            )
          )}
          onPress={toggleTheme}
          accessibilityLabel={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          size="md"
          variant="default"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sheet,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.15)',
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  bevel: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  identityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 4,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  avatarSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  presencePip: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textStack: {
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
    marginRight: 4,
  },
  pointsTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  controlCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
