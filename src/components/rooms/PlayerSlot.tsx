import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { Player } from '../../domain/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProfileIcon, CheckIcon } from '../icons/CustomIcons';

export interface PlayerSlotProps {
  player?: Player | null;
  isHost?: boolean;
  isCurrentUser?: boolean;
  isAwaiting?: boolean;
  testID?: string;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({
  player,
  isHost = false,
  isCurrentUser = false,
  isAwaiting = false,
  testID = 'player-slot',
}) => {
  const { theme } = useTheme();

  if (isAwaiting || !player) {
    return (
      <View
        testID={testID}
        style={[
          styles.container,
          styles.awaitingContainer,
          {
            backgroundColor: theme.bgRecessed,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <View style={[styles.avatarBox, { backgroundColor: theme.bgSubtle }]}>
          <ProfileIcon size={18} color={theme.textMuted} />
        </View>

        <View style={styles.infoCol}>
          <Text style={[styles.playerName, { color: theme.textMuted }]}>
            WAITING FOR PLAYER
          </Text>
          <Text style={[styles.playerSub, { color: theme.textMuted }]}>
            Share room code to invite opponent
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: theme.bgSubtle }]}>
          <View style={[styles.pulseDot, { backgroundColor: theme.textMuted }]} />
          <Text style={[styles.statusPillText, { color: theme.textMuted }]}>OPEN</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: theme.bgRecessed,
          borderColor: isCurrentUser ? COLORS.gentleOlive : theme.borderSubtle,
        },
      ]}
    >
      <View
        style={[
          styles.avatarBox,
          {
            backgroundColor: isHost ? theme.accentHazelTint : theme.accentOliveTint,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarInitial,
            { color: isHost ? '#8A6724' : COLORS.lunarShadow },
          ]}
        >
          {player.name ? player.name.slice(0, 2).toUpperCase() : 'PL'}
        </Text>
      </View>

      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.playerName, { color: theme.textPrimary }]}>
            {isCurrentUser ? 'YOU' : player.name.toUpperCase()}
          </Text>
          {isHost && (
            <View style={[styles.hostTag, { backgroundColor: theme.accentHazelTint }]}>
              <Text style={styles.hostTagText}>HOST</Text>
            </View>
          )}
        </View>
        <Text style={[styles.playerSub, { color: theme.textSecondary }]}>
          {isHost ? 'Host' : 'Opponent'} • {player.rating || 1450} MMR
        </Text>
      </View>

      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: theme.accentOliveTint,
          },
        ]}
      >
        <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
        <Text style={[styles.statusPillText, { color: COLORS.lunarShadow }]}>
          ONLINE
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.control,
    borderWidth: 1.5,
    marginVertical: 4,
    gap: SPACING.md,
  },
  awaitingContainer: {
    borderStyle: 'dashed',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.5,
  },
  playerSub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  hostTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.micro,
  },
  hostTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A6724',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
  },
});
