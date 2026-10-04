/**
 * TactileRoomCard
 * Apple HIG-Grade Staking Room Card Component
 * Concentric corners, progressive prize pool, player pulse, and integrated ticket selector.
 * Strictly 0 raw emojis (100% SVG vector iconography).
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  calcConcentricRadius,
  TOUCH_TARGET,
  SPRING_CONFIGS,
} from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { PublicRoom } from '../../domain/types';
import {
  IconTicket,
  IconCoinStack,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  IconShield,
  BingoIdentityIcon,
  ChevronIcon,
} from '../icons/CustomIcons';

export interface TactileRoomCardProps {
  room: PublicRoom;
  selectedTicketCount?: number;
  onTicketCountChange?: (count: number) => void;
  onSelectRoom: (room: PublicRoom, ticketCount: number) => void;
  userBalanceCoins?: number;
  style?: ViewStyle;
}

export const TactileRoomCard: React.FC<TactileRoomCardProps> = ({
  room,
  selectedTicketCount = 1,
  onTicketCountChange,
  onSelectRoom,
  userBalanceCoins,
  style,
}) => {
  const { theme } = useTheme();
  const [ticketCount, setTicketCount] = useState<number>(selectedTicketCount);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCardPressed, setIsCardPressed] = useState(false);
  const [isBtnPressed, setIsBtnPressed] = useState(false);

  // Concentric corner metrics
  const cardOuterRadius = 20;
  const cardPadding = SPACING.md; // 12px
  const innerPillRadius = calcConcentricRadius(cardOuterRadius, cardPadding, 8); // 8px

  // Staking calculations
  const totalCost = room.ticketPrice * ticketCount;
  const canAfford = userBalanceCoins === undefined || userBalanceCoins >= totalCost;

  const handleIncrement = () => {
    if (ticketCount < 4) {
      const next = ticketCount + 1;
      setTicketCount(next);
      onTicketCountChange?.(next);
    }
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      const next = ticketCount - 1;
      setTicketCount(next);
      onTicketCountChange?.(next);
    }
  };

  // Tier determination
  const getTierDetails = (price: number) => {
    if (price >= 10) return { label: 'VIP HIGH ROLLER', color: COLORS.goldPrimary, bg: 'rgba(245, 158, 11, 0.14)' };
    if (price >= 5) return { label: 'GOLD ARENA', color: COLORS.winterHazel, bg: 'rgba(230, 202, 154, 0.14)' };
    if (price >= 3) return { label: 'SILVER SUITE', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.14)' };
    return { label: 'STANDARD OPEN', color: COLORS.gentleOlive, bg: 'rgba(203, 215, 126, 0.14)' };
  };

  const tier = getTierDetails(room.ticketPrice);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.borderSubtle,
          borderRadius: cardOuterRadius,
          padding: cardPadding,
          transform: [{ scale: isCardPressed ? SPRING_CONFIGS.cardPress.scaleDown : 1 }],
        },
        style,
      ]}
    >
      {/* 1px Specular Bevel Edge */}
      <View style={styles.topBevel} />

      {/* Header: Room Title, Tier Badge & Active Live Pulse */}
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <View style={[styles.avatarWell, { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle }]}>
            <BingoIdentityIcon size={18} color={tier.color} variant="filled" />
          </View>
          <View style={styles.titleTextColumn}>
            <Text style={[styles.roomName, { color: theme.textPrimary }]} numberOfLines={1}>
              {room.name}
            </Text>
            {/* Live Player Count with Breathing Pulse */}
            <View style={styles.livePulseContainer}>
              <View style={[styles.pulsePip, { backgroundColor: COLORS.playEmerald }]} />
              <Text style={[styles.playerCountText, { color: theme.textSecondary }]}>
                {room.playerCount} / {room.maxPlayers} active players
              </Text>
            </View>
          </View>
        </View>

        {/* Staking Tier Micro-Badge */}
        <View
          style={[
            styles.tierBadge,
            {
              backgroundColor: tier.bg,
              borderColor: tier.color,
              borderRadius: innerPillRadius,
            },
          ]}
        >
          <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
        </View>
      </View>

      {/* Prize Pool & Staking Spec Sheet */}
      <View
        style={[
          styles.telemetryShelf,
          {
            backgroundColor: theme.bgRecessed,
            borderColor: theme.borderSubtle,
            borderRadius: innerPillRadius,
          },
        ]}
      >
        <View style={styles.telemetryColumn}>
          <Text style={[styles.telemetryLabel, { color: theme.textMuted }]}>
            JACKPOT POOL
          </Text>
          <View style={styles.goldValRow}>
            <IconCoinStack size={16} color={COLORS.goldPrimary} />
            <Text style={styles.jackpotVal}>
              ${room.jackpotAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: theme.borderSubtle }]} />

        <View style={styles.telemetryColumn}>
          <Text style={[styles.telemetryLabel, { color: theme.textMuted }]}>
            ENTRY PER CARD
          </Text>
          <View style={styles.ticketValRow}>
            <IconTicket size={16} color={theme.textPrimary} />
            <Text style={[styles.ticketPriceVal, { color: theme.textPrimary }]}>
              ${room.ticketPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Interactive Staking Stepper & Confirm Trigger */}
      <View style={styles.actionRow}>
        {/* [- 1 +] Concentric Ticket Selector */}
        <View
          style={[
            styles.stepperContainer,
            {
              backgroundColor: theme.bgRecessed,
              borderColor: theme.borderSubtle,
              borderRadius: RADIUS.control,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.stepperBtn,
              ticketCount <= 1 && styles.stepperBtnDisabled,
            ]}
            onPress={handleDecrement}
            disabled={ticketCount <= 1}
            hitSlop={TOUCH_TARGET.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Decrease tickets"
          >
            <Text style={[styles.stepperSign, { color: ticketCount <= 1 ? theme.textMuted : theme.textPrimary }]}>
              −
            </Text>
          </TouchableOpacity>

          <View style={styles.stepperCountWell}>
            <IconTicket size={14} color={COLORS.winterHazel} style={{ marginRight: 4 }} />
            <Text style={[styles.stepperCountText, { color: theme.textPrimary }]}>
              {ticketCount}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.stepperBtn,
              ticketCount >= 4 && styles.stepperBtnDisabled,
            ]}
            onPress={handleIncrement}
            disabled={ticketCount >= 4}
            hitSlop={TOUCH_TARGET.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Increase tickets"
          >
            <Text style={[styles.stepperSign, { color: ticketCount >= 4 ? theme.textMuted : theme.textPrimary }]}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Staking Button */}
        <TouchableOpacity
          style={[
            styles.enterBtn,
            {
              backgroundColor: canAfford ? COLORS.playEmerald : '#334155',
              transform: [{ scale: isBtnPressed ? 0.96 : 1 }],
            },
          ]}
          activeOpacity={0.88}
          onPressIn={() => setIsBtnPressed(true)}
          onPressOut={() => setIsBtnPressed(false)}
          onPress={() => onSelectRoom(room, ticketCount)}
          accessibilityRole="button"
          accessibilityLabel={`Join room ${room.name} with ${ticketCount} tickets for $${totalCost.toFixed(2)}`}
        >
          <View style={styles.btnBevel} />
          <Text style={styles.enterBtnText}>
            Stake ${totalCost.toFixed(2)}
          </Text>
          <ChevronIcon direction="right" size={16} color="#0B0E14" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    marginVertical: SPACING.xs + 2,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.borderSpecularStrong,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  avatarWell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleTextColumn: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: -0.2,
  },
  livePulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  pulsePip: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  playerCountText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
  },
  telemetryShelf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  telemetryColumn: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 28,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  goldValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jackpotVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.goldPrimary,
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  ticketValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketPriceVal: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: Math.max(44, TOUCH_TARGET.minSize),
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 36,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperSign: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  stepperCountWell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepperCountText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  enterBtn: {
    flex: 1,
    height: Math.max(44, TOUCH_TARGET.minSize),
    borderRadius: RADIUS.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.playEmerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnBevel: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  enterBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0E14',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.2,
  },
});
