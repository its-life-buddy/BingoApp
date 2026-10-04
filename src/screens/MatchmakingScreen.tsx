/**
 * MatchmakingScreen
 * Apple HIG-grade tactile Matchmaking & Waiting Room Screen.
 * 
 * Displays:
 * 1. Searching radar / pulse state with live elapsed timer.
 * 2. Distinct "Waiting for another player..." status (strictly NO fake bots).
 * 3. Match Found reveal card with Opponent Identity (Avatar, Name, MMR, Tier).
 * 4. Synchronized 3-second countdown to game start.
 * 5. Responsive, accessible "Cancel Matchmaking" action.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../design/tokens';
import { useTheme } from '../design/theme';
import { Player, MatchmakingStatus } from '../domain/types';
import {
  ProfileIcon,
  CloseIcon,
  BingoIdentityIcon,
  UsersIcon,
  CheckIcon,
} from '../components/icons/CustomIcons';

interface MatchmakingScreenProps {
  player: Player;
  opponent?: Player | null;
  status: MatchmakingStatus;
  countdownSeconds?: number | null;
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({
  player,
  opponent,
  status,
  countdownSeconds = null,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Elapsed wait timer
  useEffect(() => {
    let timer: any = null;
    if (status === 'SEARCHING' || status === 'WAITING_FOR_PLAYER') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const isMatched = status === 'MATCH_FOUND' || status === 'GAME_STARTING';

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      {/* HEADER BAR */}
      <View style={[styles.headerBar, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.identityIconWrap, { backgroundColor: theme.accentOliveTint }]}>
            <BingoIdentityIcon size={20} color={COLORS.lunarShadow} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Random Matchmaking
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              5×5 Matrix • Live 1v1 Arena
            </Text>
          </View>
        </View>

        {!isMatched && (
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle }]}
            onPress={onCancel}
            hitSlop={TOUCH_TARGET.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Cancel matchmaking"
          >
            <CloseIcon size={16} color={theme.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* CENTRAL STAGE */}
      <View style={styles.stageWrap}>
        {!isMatched ? (
          /* SEARCHING / WAITING STAGE */
          <View style={styles.searchingCard}>
            {/* Animated Pulse Ring */}
            <View style={[styles.pulseRingOuter, { borderColor: theme.accentOliveTint }]}>
              <View style={[styles.pulseRingInner, { backgroundColor: theme.accentOliveTint }]}>
                <UsersIcon size={36} color={COLORS.lunarShadow} />
              </View>
            </View>

            <View style={styles.searchingTextGroup}>
              <Text style={[styles.searchingHeading, { color: theme.textPrimary }]}>
                {status === 'SEARCHING' ? 'Connecting to queue…' : 'Waiting for an opponent…'}
              </Text>
              <Text style={[styles.searchingSub, { color: theme.textSecondary }]}>
                Looking for another online player. You will never be paired with a robot.
              </Text>
            </View>

            {/* Elapsed Timer Pill */}
            <View
              style={[
                styles.timerPill,
                { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
              ]}
            >
              <ActivityIndicator size="small" color={COLORS.gentleOlive} />
              <Text style={[styles.timerText, { color: theme.textPrimary }]}>
                Queue Time: {formatElapsed(elapsedSeconds)}
              </Text>
            </View>

            {/* Current Player Identity Card */}
            <View
              style={[
                styles.playerCard,
                { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle },
              ]}
            >
              <View style={[styles.playerAvatarSphere, { backgroundColor: theme.accentOliveTint }]}>
                <ProfileIcon size={24} color={COLORS.lunarShadow} />
              </View>
              <View style={styles.playerMeta}>
                <Text style={[styles.playerNameText, { color: theme.textPrimary }]}>
                  {player.name} (You)
                </Text>
                <Text style={[styles.playerRatingText, { color: theme.textSecondary }]}>
                  {player.tier} • {player.rating} MMR
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.accentOliveTint }]}>
                <Text style={[styles.statusBadgeText, { color: COLORS.lunarShadow }]}>
                  In Queue
                </Text>
              </View>
            </View>

            {/* Big Action Cancel Button */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
              ]}
              onPress={onCancel}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel Matchmaking Search"
            >
              <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>
                Cancel Search
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* MATCH FOUND & COUNTDOWN STAGE */
          <View style={styles.matchedCard}>
            {/* Countdown Banner */}
            <View
              style={[
                styles.countdownBadge,
                { backgroundColor: COLORS.primaryOrange, borderColor: '#E06900' },
              ]}
            >
              <Text style={[styles.countdownBadgeText, { color: '#FFFFFF' }]}>
                MATCH FOUND!
              </Text>
              {countdownSeconds !== null && (
                <Text style={[styles.countdownDigits, { color: '#FFFFFF' }]}>
                  {`Game starting in ${countdownSeconds}s`}
                </Text>
              )}
            </View>


            {/* VS SHOWDOWN ROW */}
            <View style={styles.vsContainer}>
              {/* Left: Current Player */}
              <View
                style={[
                  styles.vsPlayerBox,
                  { backgroundColor: theme.bgCard, borderColor: COLORS.primaryOrange },
                ]}
              >
                <View style={[styles.vsAvatarSphere, { backgroundColor: 'rgba(255, 122, 0, 0.12)' }]}>
                  <ProfileIcon size={28} color={COLORS.primaryOrange} />
                </View>
                <Text style={[styles.vsPlayerName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {player.name}
                </Text>
                <Text style={[styles.vsPlayerMMR, { color: theme.textSecondary }]}>
                  {`${player.rating} MMR`}
                </Text>
                <View style={[styles.vsReadyPill, { backgroundColor: theme.accentOliveTint }]}>
                  <CheckIcon size={12} color={COLORS.lunarShadow} />
                  <Text style={[styles.vsReadyText, { color: COLORS.lunarShadow }]}>Ready</Text>
                </View>
              </View>

              {/* VS Crest */}
              <View style={[styles.vsCircle, { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.vsCircleText, { color: theme.textMuted }]}>VS</Text>
              </View>

              {/* Right: Opponent Player */}
              <View
                style={[
                  styles.vsPlayerBox,
                  { backgroundColor: theme.bgCard, borderColor: COLORS.winterHazel },
                ]}
              >
                <View style={[styles.vsAvatarSphere, { backgroundColor: theme.accentHazelTint }]}>
                  <ProfileIcon size={28} color={COLORS.winterHazel} />
                </View>
                <Text style={[styles.vsPlayerName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {opponent?.name || 'Challenger'}
                </Text>
                <Text style={[styles.vsPlayerMMR, { color: theme.textSecondary }]}>
                  {`${opponent?.rating || 1450} MMR`}
                </Text>

                <View style={[styles.vsReadyPill, { backgroundColor: theme.accentHazelTint }]}>
                  <CheckIcon size={12} color={COLORS.winterHazel} />
                  <Text style={[styles.vsReadyText, { color: COLORS.winterHazel }]}>Matched</Text>
                </View>
              </View>
            </View>

            <View style={styles.launchInfoBox}>
              <Text style={[styles.launchInfoText, { color: theme.textSecondary }]}>
                Synchronizing 5×5 matrix boards & authoritative ball sequence…
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityIconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageWrap: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  pulseRingOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRingInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingTextGroup: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  searchingHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  searchingSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  playerCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.sheet,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  playerAvatarSphere: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerMeta: {
    flex: 1,
  },
  playerNameText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  playerRatingText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  matchedCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  countdownBadge: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.sheet,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  countdownBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  countdownDigits: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  vsPlayerBox: {
    flex: 1,
    padding: 16,
    borderRadius: RADIUS.sheet,
    borderWidth: 2,
    alignItems: 'center',
  },
  vsAvatarSphere: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vsPlayerName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  vsPlayerMMR: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  vsReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
  },
  vsReadyText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  vsCircleText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  launchInfoBox: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  launchInfoText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
