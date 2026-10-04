/**
 * PowerUpDockWidget
 * Apple HIG-Grade Tactile Floating Power-Up Console Dock
 * Radial charging energy ring, ready-state pulse, one-tap instant activation.
 * 100% Vector SVG Iconography (Zero Raw Emojis).
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import {
  COLORS,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  calcConcentricRadius,
  TOUCH_TARGET,
  SPRING_CONFIGS,
} from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { PowerUpType } from '../../domain/types';
import {
  IconLightning,
  IconTarget,
  IconGemstone,
  IconCoinStack,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  BingoIdentityIcon,
} from '../icons/CustomIcons';

export interface PowerUpItem {
  id: PowerUpType;
  name: string;
  count: number;
  costInEnergy: number; // e.g. 25, 50, 75, 100
  iconComponent: React.ReactNode;
  accentColor: string;
  tagline: string;
}

export interface PowerUpDockWidgetProps {
  currentEnergy?: number; // 0 to 100
  onUsePowerUp: (type: PowerUpType, name: string) => void;
  onOpenNextBallModal?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PowerUpDockWidget: React.FC<PowerUpDockWidgetProps> = ({
  currentEnergy = 45,
  onUsePowerUp,
  onOpenNextBallModal,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  const [activePressedId, setActivePressedId] = useState<string | null>(null);

  // Concentric metrics
  const dockOuterRadius = 24;
  const dockPadding = 6;
  const slotRadius = calcConcentricRadius(dockOuterRadius, dockPadding, 16);

  const powerUps: PowerUpItem[] = [
    {
      id: 'FREE_DAUB',
      name: 'Free Daub',
      count: 3,
      costInEnergy: 25,
      iconComponent: <IconLightning size={20} color={COLORS.winterHazel} />,
      accentColor: COLORS.winterHazel,
      tagline: 'Instantly daub a cell',
    },
    {
      id: 'INSTANT_BINGO',
      name: 'Instant Line',
      count: 1,
      costInEnergy: 80,
      iconComponent: <IconTarget size={20} color={COLORS.playEmerald} />,
      accentColor: COLORS.playEmerald,
      tagline: 'Mark closest winning path',
    },
    {
      id: 'DOUBLE_PAYOUT',
      name: '2x Payout',
      count: 2,
      costInEnergy: 50,
      iconComponent: <IconGemstone size={20} color={COLORS.infoBlue} />,
      accentColor: COLORS.infoBlue,
      tagline: 'Double your match rewards',
    },
  ];

  // SVG Radial Progress Ring
  const ringSize = 44;
  const strokeWidth = 3.5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentEnergy / 100) * circumference;
  const isFullyCharged = currentEnergy >= 100;

  return (
    <View
      style={[
        styles.dockContainer,
        {
          backgroundColor: theme.bgCard,
          borderColor: isFullyCharged ? COLORS.winterHazel : theme.borderSubtle,
          borderRadius: dockOuterRadius,
          padding: dockPadding,
        },
        isFullyCharged && styles.dockChargedGlow,
        style,
      ]}
    >
      {/* 1px Specular Bevel Edge */}
      <View style={styles.topBevel} />

      {/* Left: Energy Meter with Radial Progress */}
      <View style={styles.energySection}>
        <View style={styles.radialRingContainer}>
          <Svg width={ringSize} height={ringSize} style={styles.svgRing as any}>
            {/* Background track */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={theme.borderSubtle}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active progress stroke */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={isFullyCharged ? COLORS.winterHazel : COLORS.gentleOlive}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>
          <View style={styles.ringCenterBadge}>
            <Text style={[styles.energyPercentText, { color: isFullyCharged ? COLORS.winterHazel : theme.textPrimary }]}>
              {currentEnergy}%
            </Text>
          </View>
        </View>

        <View style={styles.energyLabelColumn}>
          <Text style={[styles.energyStatusTitle, { color: isFullyCharged ? COLORS.winterHazel : theme.textPrimary }]}>
            {isFullyCharged ? 'SUPERCHARGED' : 'TACTICAL DOCK'}
          </Text>
          <Text style={[styles.energyStatusSub, { color: theme.textMuted }]}>
            {isFullyCharged ? 'Tap to trigger' : 'Charge with daubs'}
          </Text>
        </View>
      </View>

      {/* Right: Power-Up Action Buttons */}
      <View style={styles.buttonsRow}>
        {powerUps.map((item) => {
          const isPressed = activePressedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              disabled={disabled}
              onPressIn={() => setActivePressedId(item.id)}
              onPressOut={() => setActivePressedId(null)}
              onPress={() => onUsePowerUp(item.id, item.name)}
              activeOpacity={0.85}
              style={[
                styles.powerSlot,
                {
                  borderRadius: slotRadius,
                  backgroundColor: theme.bgRecessed,
                  borderColor: isPressed ? item.accentColor : theme.borderSubtle,
                  transform: [{ scale: isPressed ? SPRING_CONFIGS.cardPress.scaleDown : 1 }],
                },
              ]}
              hitSlop={TOUCH_TARGET.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={`${item.name} power-up. ${item.count} remaining. ${item.tagline}`}
            >
              <View style={styles.slotBevel} />
              <View style={styles.iconWrap}>
                {item.iconComponent}
              </View>
              {/* Badge count */}
              <View style={[styles.countBadge, { backgroundColor: item.accentColor }]}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bonus Next Ball Slot */}
        {onOpenNextBallModal && (
          <TouchableOpacity
            disabled={disabled}
            onPressIn={() => setActivePressedId('next_ball')}
            onPressOut={() => setActivePressedId(null)}
            onPress={onOpenNextBallModal}
            activeOpacity={0.85}
            style={[
              styles.powerSlot,
              {
                borderRadius: slotRadius,
                backgroundColor: theme.bgRecessed,
                borderColor: activePressedId === 'next_ball' ? COLORS.goldPrimary : theme.borderSubtle,
                transform: [{ scale: activePressedId === 'next_ball' ? SPRING_CONFIGS.cardPress.scaleDown : 1 }],
              },
            ]}
            hitSlop={TOUCH_TARGET.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Next Ball Bonus Multiplier"
          >
            <View style={styles.slotBevel} />
            <View style={styles.iconWrap}>
              <IconCoinStack size={20} color={COLORS.goldPrimary} />
            </View>
            <View style={[styles.countBadge, { backgroundColor: COLORS.goldPrimary }]}>
              <Text style={styles.countText}>$</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.borderSpecularStrong,
  },
  dockChargedGlow: {
    shadowColor: COLORS.winterHazel,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  energySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.xs,
    flex: 1,
  },
  radialRingContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringCenterBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyPercentText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  energyLabelColumn: {
    marginLeft: SPACING.sm,
  },
  energyStatusTitle: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
  },
  energyStatusSub: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  powerSlot: {
    width: Math.max(46, TOUCH_TARGET.minSize),
    height: Math.max(46, TOUCH_TARGET.minSize),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotBevel: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#16181B',
  },
  countText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0B0E14',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
});
