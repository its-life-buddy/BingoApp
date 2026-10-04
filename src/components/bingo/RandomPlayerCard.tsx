import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { Player, MatchmakingStatus, PublicRoom } from '../../domain/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UsersIcon, CheckIcon, CloseIcon } from '../icons/CustomIcons';
import { StatusBadge } from '../shared/StatusBadge';

export interface RandomPlayerCardProps {
  state: MatchmakingStatus;
  opponent?: Player | null;
  room?: PublicRoom | null;
  onlineCount?: number | null;
  onFindPlayer?: () => void;
  onCancel?: () => void;
  onReturnLobby?: () => void;
  testID?: string;
}

export const RandomPlayerCard: React.FC<RandomPlayerCardProps> = ({
  state = 'IDLE',
  opponent,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  room,
  onlineCount = 1240,
  onFindPlayer,
  onCancel,
  onReturnLobby,
  testID,
}) => {
  const { theme } = useTheme();

  // Distinct visual state branches
  const isSearching = state === 'SEARCHING';
  const isWaiting = state === 'WAITING_FOR_PLAYER';
  const isMatched = state === 'MATCH_FOUND' || state === 'GAME_STARTING';
  const isDisconnected = state === 'DISCONNECTED' || state === 'CLOSED';
  const isError = state === 'ERROR';

  return (
    <View
      testID={testID}
      style={[
        styles.heroCard,
        {
          backgroundColor: theme.bgCard,
          borderColor: isMatched
            ? '#10B981'
            : isDisconnected
            ? COLORS.dangerRed
            : isSearching || isWaiting
            ? '#F59E0B'
            : COLORS.gentleOlive,
        },
      ]}
    >
      {/* Specular Edge Hairline */}
      <View style={styles.specularBevel} />

      {/* 1. STATUS RAIL LAYER */}
      <View style={styles.statusRail}>
        {isMatched ? (
          <StatusBadge variant="matched" label="OPPONENT FOUND" />
        ) : isDisconnected ? (
          <StatusBadge variant="closed" label="ROOM CLOSED" />
        ) : isSearching || isWaiting ? (
          <StatusBadge variant="waiting" label="QUEUE ACTIVE" pulse />
        ) : isError ? (
          <StatusBadge variant="error" label="CONNECTION ERROR" />
        ) : (
          <StatusBadge variant="human" label="REAL HUMAN 1V1" pulse />
        )}

        <View
          style={[
            styles.telemetryPill,
            { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
          ]}
        >
          <Text style={[styles.telemetryText, { color: theme.textSecondary }]}>
            {onlineCount ? `${onlineCount.toLocaleString()} Online` : 'Live Arena'}
          </Text>
        </View>
      </View>

      {/* 2. DYNAMIC CONTENT & IDENTITY LAYER */}
      {isMatched && opponent ? (
        /* MATCHED STATE: 1v1 Clash Identity View */
        <View style={styles.matchedSection}>
          <View style={styles.clashRow}>
            <View style={styles.playerBlock}>
              <View style={[styles.miniAvatar, { backgroundColor: theme.accentOliveTint }]}>
                <Text style={styles.miniAvatarText}>YOU</Text>
              </View>
              <Text style={[styles.playerTag, { color: theme.textPrimary }]}>Ready</Text>
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerBlock}>
              <View style={[styles.miniAvatar, { backgroundColor: theme.accentHazelTint }]}>
                <Text style={[styles.miniAvatarText, { color: '#8A6724' }]}>
                  {opponent.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.playerTag, { color: theme.textPrimary }]} numberOfLines={1}>
                {opponent.name}
              </Text>
            </View>
          </View>

          <Text style={[styles.startingBanner, { color: '#10B981' }]}>
            ✓ Room verified • Launching game…
          </Text>
        </View>
      ) : isDisconnected ? (
        /* DISCONNECTED STATE */
        <View style={styles.stateNoticeGroup}>
          <Text style={[styles.headline, { color: COLORS.dangerRed }]}>
            Opponent Disconnected
          </Text>
          <Text style={[styles.subtext, { color: theme.textSecondary }]}>
            The active match has ended. You will be safely returned to the lobby.
          </Text>
          {onReturnLobby && (
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: COLORS.dangerRed, marginTop: SPACING.sm }]}
              onPress={onReturnLobby}
              accessibilityRole="button"
              accessibilityLabel="Return to Lobby"
            >
              <Text style={[styles.cancelBtnText, { color: COLORS.dangerRed }]}>
                Back to Lobby
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isSearching || isWaiting ? (
        /* SEARCHING / WAITING STATE */
        <View style={styles.searchingSection}>
          <View style={styles.searchingInfoRow}>
            <ActivityIndicator size="small" color={COLORS.gentleOlive} />
            <Text style={[styles.searchingHeadline, { color: theme.textPrimary }]}>
              {isSearching ? 'Connecting to queue…' : 'Waiting for a real opponent…'}
            </Text>
          </View>
          <Text style={[styles.subtext, { color: theme.textSecondary }]}>
            Looking for an authentic challenger. Bot matches are strictly prohibited here.
          </Text>

          {onCancel && (
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
              ]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel Matchmaking Search"
            >
              <CloseIcon size={14} color={theme.textPrimary} />
              <Text style={[styles.cancelBtnText, { color: theme.textPrimary }]}>
                Cancel Search
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* DEFAULT IDLE STATE */
        <View style={styles.idleSection}>
          <View style={styles.headlineRow}>
            <View style={styles.textGroup}>
              <Text style={[styles.headline, { color: theme.textPrimary }]}>
                Random Player
              </Text>
              <Text style={[styles.subtext, { color: theme.textSecondary }]}>
                Instant 1v1 Battle • Synchronized 5×5 Matrix • Real Opponents Only
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.findPlayerBtn, { backgroundColor: COLORS.gentleOlive }]}
              onPress={onFindPlayer}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Play Random Player, Real Human 1v1 Matchmaking"
            >
              <UsersIcon size={20} color={COLORS.lunarShadow} />
              <Text style={styles.findPlayerBtnText}>FIND PLAYER</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.sheet,
    padding: SPACING.md + 4,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#A4B456',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: SPACING.md,
  },
  specularBevel: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  statusRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
  telemetryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  telemetryText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  idleSection: {
    marginTop: 2,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  textGroup: {
    flex: 1,
  },
  headline: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  subtext: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  findPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderBottomWidth: 3,
    borderBottomColor: '#8C9A3C',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  findPlayerBtnText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  searchingSection: {
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  searchingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchingHeadline: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  matchedSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  clashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    width: '100%',
  },
  playerBlock: {
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
  },
  miniAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniAvatarText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  playerTag: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  vsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  startingBanner: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  stateNoticeGroup: {
    gap: 4,
    paddingVertical: 4,
  },
});
