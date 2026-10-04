import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ActivityIndicator,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { Player, MatchmakingStatus, PublicRoom } from '../../domain/types';
import {
  CloseIcon,
  UsersIcon,
  CheckIcon,
} from '../icons/CustomIcons';
import { StatusBadge } from '../shared/StatusBadge';
import { IconButton } from '../shared/IconButton';

export interface MatchmakingStateProps {
  state: MatchmakingStatus;
  player: Player;
  opponent?: Player | null;
  room?: PublicRoom | null;
  message?: string;
  countdownSeconds?: number | null;
  onCancel?: () => void;
  onBack?: () => void;
  testID?: string;
}

export const MatchmakingState: React.FC<MatchmakingStateProps> = ({
  state,
  player,
  opponent,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  room,
  message,
  countdownSeconds = null,
  onCancel,
  onBack,
  testID,
}) => {
  const { theme } = useTheme();

  const isMatched = state === 'MATCH_FOUND' || state === 'GAME_STARTING';
  const isDisconnected = state === 'DISCONNECTED' || state === 'CLOSED';
  const isError = state === 'ERROR';

  return (
    <View style={styles.container} testID={testID}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {isMatched ? 'MATCH CONFIRMED' : 'ARENA MATCHMAKING'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Live 1v1 Arena • Synchronized 5×5 Board
          </Text>
        </View>

        {!isMatched && onCancel && (
          <IconButton
            icon={({ size, color }) => <CloseIcon size={size} color={color} />}
            onPress={onCancel}
            accessibilityLabel="Cancel matchmaking"
            size="md"
            variant="default"
          />
        )}
      </View>

      {/* Main Presentation Surface */}
      <View
        style={[
          styles.mainSurface,
          {
            backgroundColor: theme.bgCard,
            borderColor: isMatched
              ? '#10B981'
              : isDisconnected || isError
              ? COLORS.dangerRed
              : theme.borderSubtle,
          },
        ]}
      >
        {/* Specular Hairline */}
        <View style={styles.hairline} />

        {isMatched && opponent ? (
          /* MATCHED VIEW */
          <View style={styles.stateBlock}>
            <StatusBadge variant="matched" label="OPPONENT CONNECTED" />

            <View style={styles.versusStage}>
              {/* Local Player Card */}
              <View
                style={[
                  styles.combatantCard,
                  { backgroundColor: theme.bgRecessed, borderColor: theme.accentOlive },
                ]}
              >
                <View style={[styles.combatantAvatar, { backgroundColor: theme.accentOliveTint }]}>
                  <Text style={styles.avatarInitials}>{player.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={[styles.combatantName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {player.name} (You)
                </Text>
                <Text style={[styles.combatantMmr, { color: theme.textMuted }]}>
                  {player.rating} MMR
                </Text>
              </View>

              {/* Center VS Emblem */}
              <View style={styles.vsCircle}>
                <Text style={styles.vsCircleText}>VS</Text>
              </View>

              {/* Opponent Card */}
              <View
                style={[
                  styles.combatantCard,
                  { backgroundColor: theme.bgRecessed, borderColor: COLORS.winterHazel },
                ]}
              >
                <View style={[styles.combatantAvatar, { backgroundColor: theme.accentHazelTint }]}>
                  <Text style={[styles.avatarInitials, { color: '#8A6724' }]}>
                    {opponent.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.combatantName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {opponent.name}
                </Text>
                <Text style={[styles.combatantMmr, { color: theme.textMuted }]}>
                  {opponent.rating} MMR
                </Text>
              </View>
            </View>

            {/* Countdown Banner */}
            <View style={[styles.countdownBox, { backgroundColor: theme.accentOliveTint }]}>
              <CheckIcon size={16} color={COLORS.lunarShadow} />
              <Text style={styles.countdownBoxText}>
                {countdownSeconds !== null
                  ? `Match launches in ${countdownSeconds}s`
                  : 'Preparing game matrix…'}
              </Text>
            </View>
          </View>
        ) : isDisconnected ? (
          /* DISCONNECTED VIEW */
          <View style={styles.stateBlock}>
            <StatusBadge variant="closed" label="DISCONNECTED" />
            <Text style={[styles.stateHeading, { color: COLORS.dangerRed }]}>
              Room Closed
            </Text>
            <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>
              {message || 'The other player disconnected. The match was closed and cannot be resumed.'}
            </Text>

            {onBack && (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: COLORS.gentleOlive }]}
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Return to Lobby"
              >
                <Text style={styles.primaryActionBtnText}>RETURN TO LOBBY</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : isError ? (
          /* ERROR VIEW */
          <View style={styles.stateBlock}>
            <StatusBadge variant="error" label="ERROR" />
            <Text style={[styles.stateHeading, { color: COLORS.dangerRed }]}>
              Connection Failed
            </Text>
            <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>
              {message || 'Could not communicate with the matchmaking server.'}
            </Text>

            {onBack && (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: COLORS.gentleOlive }]}
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Go back to lobby"
              >
                <Text style={styles.primaryActionBtnText}>BACK TO LOBBY</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* WAITING / SEARCHING VIEW */
          <View style={styles.stateBlock}>
            <StatusBadge variant="waiting" label="QUEUE ACTIVE" pulse />

            <View style={styles.pulseContainer}>
              <View style={[styles.pulseCircle, { borderColor: theme.accentOliveTint }]}>
                <View style={[styles.pulseInner, { backgroundColor: theme.accentOliveTint }]}>
                  <UsersIcon size={32} color={COLORS.lunarShadow} />
                </View>
              </View>
            </View>

            <Text style={[styles.stateHeading, { color: theme.textPrimary }]}>
              Waiting for an opponent…
            </Text>
            <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>
              Connecting to live matchmaking. Real human opponents only; bot matches are strictly excluded.
            </Text>

            {onCancel && (
              <TouchableOpacity
                style={[
                  styles.cancelSearchBtn,
                  { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
                ]}
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel="Cancel Matchmaking Search"
              >
                <CloseIcon size={14} color={theme.textPrimary} />
                <Text style={[styles.cancelSearchText, { color: theme.textPrimary }]}>
                  Cancel Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: SPACING.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  mainSurface: {
    borderRadius: RADIUS.hero,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  stateBlock: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  stateHeading: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  stateMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  pulseContainer: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versusStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
    paddingVertical: SPACING.sm,
  },
  combatantCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.surface,
    borderWidth: 1.5,
    gap: 4,
  },
  combatantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  combatantName: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  combatantMmr: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircleText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
  },
  countdownBoxText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  primaryActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cancelSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  cancelSearchText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
