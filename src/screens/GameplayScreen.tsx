/**
 * GameplayScreen
 * Apple HIG-Grade Tactical Bingo Match Interface
 * Integrates BingoMatrixCard with 1-4 multi-card synchronization,
 * CallerHUD with physics entry, and zero raw emojis (100% vector SVG).
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Board5x5, GridCell5x5, PowerUpType } from '../domain/types';
import { BingoMatrixCard } from '../components/game/BingoMatrixCard';
import { CallerHUD } from '../components/game/CallerHUD';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SPRING_CONFIGS, TOUCH_TARGET } from '../design/tokens';
import {
  CheckIcon,
  CloseIcon,
  ChevronIcon,
  PauseIcon,
  ResumeIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  BingoIdentityIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  IconSparkles,
} from '../components/icons/CustomIcons';
import { useTheme } from '../design/theme';
import { PatternCompletedBanner } from '../components/game/InGameOverlays';

interface GameplayScreenProps {
  board: Board5x5;
  additionalBoards?: Board5x5[];
  drawnNumbers: number[];
  score: number;
  linesCompletedCount: number;
  isGameActive: boolean;
  isPaused: boolean;
  onCellPress: (cell: GridCell5x5, boardIndex?: number) => void;
  onClaimBingo: () => void;
  onTogglePause?: () => void;
  onLeaveGame: () => void;
  lastCompletedPatternName?: string;
  claimFeedback?: { success: boolean; message: string } | null;
  opponentLines?: number;
  opponentName?: string;
  currentTurnPlayerId?: string;
  turnExpiresAt?: number;
  playerId?: string;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  board,
  additionalBoards = [],
  drawnNumbers,
  score,
  linesCompletedCount,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  isGameActive,
  isPaused,
  onCellPress,
  onClaimBingo,
  onTogglePause,
  onLeaveGame,
  lastCompletedPatternName,
  claimFeedback,
  opponentLines,
  opponentName,
  currentTurnPlayerId,
  turnExpiresAt,
  playerId,
}) => {
  const { theme } = useTheme();
  const [activeBoardIdx, setActiveBoardIdx] = useState<number>(0);
  const [isBingoPressed, setIsBingoPressed] = useState<boolean>(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(0);

  React.useEffect(() => {
    if (!turnExpiresAt || !currentTurnPlayerId) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((turnExpiresAt - Date.now()) / 1000));
      setTurnSecondsLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [turnExpiresAt, currentTurnPlayerId]);

  const allBoards = [board, ...additionalBoards];
  const currentBoard = allBoards[activeBoardIdx] || board;

  const currentCall = drawnNumbers[0];
  const recentCalls = drawnNumbers.slice(1, 6);
  const calledNumbersSet = new Set(drawnNumbers);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bgCanvas }]}
      showsVerticalScrollIndicator={false}
    >
      {/* TOP TURN BANNER (Matching Screenshot 5) */}
      <View style={styles.topTurnBanner}>
        <Text style={styles.topTurnText}>
          {currentTurnPlayerId && playerId
            ? currentTurnPlayerId === playerId
              ? `YOUR TURN (${turnSecondsLeft}s)`
              : `OPPONENT'S TURN (${turnSecondsLeft}s)`
            : 'YOUR TURN (9s)'}
        </Text>
      </View>

      {/* TOP MATCH TELEMETRY HUD */}
      <View style={[styles.hudBar, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}>
        <View style={styles.hudBevel} />
        <TouchableOpacity
          onPress={onLeaveGame}
          style={[styles.exitBtn, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}
          hitSlop={TOUCH_TARGET.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Back to Lobby"
        >
          <ChevronIcon direction="left" size={16} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.hudScores}>
          <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>SCORE</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{score.toLocaleString()}</Text>
          </View>

          <View style={[styles.statBox, styles.linesBox, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>MY LINES</Text>
            <Text style={[styles.linesValue, { color: COLORS.primaryOrange }]}>{linesCompletedCount} / 5</Text>
          </View>

          <View style={[styles.statBox, styles.opponentBox, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {opponentName ? opponentName.toUpperCase() : 'ROBOT AI'}
            </Text>
            <Text style={[styles.opponentLinesValue, { color: COLORS.primaryOrange }]}>
              {opponentLines !== undefined ? opponentLines : 0} / 5
            </Text>
          </View>
        </View>

        {onTogglePause && (
          <TouchableOpacity
            onPress={onTogglePause}
            style={[styles.pauseBtn, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}
            hitSlop={TOUCH_TARGET.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? <ResumeIcon size={12} color={COLORS.primaryOrange} /> : <PauseIcon size={12} color={theme.textPrimary} />}
            <Text style={[styles.pauseText, { color: theme.textPrimary }]}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MULTI-CARD SELECTOR TABS (If user purchased > 1 card) */}
      {allBoards.length > 1 && (
        <View style={styles.cardTabsRow}>
          {allBoards.map((b, idx) => {
            const isActive = activeBoardIdx === idx;
            return (
              <TouchableOpacity
                key={b.id || idx}
                style={[
                  styles.cardTab,
                  {
                    backgroundColor: isActive ? COLORS.cleanWhite : theme.bgCard,
                    borderColor: isActive ? COLORS.primaryOrange : theme.borderSubtle,
                  },
                ]}
                onPress={() => setActiveBoardIdx(idx)}
                hitSlop={TOUCH_TARGET.hitSlop}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.cardTabText,
                    {
                      color: isActive ? COLORS.primaryOrange : theme.textSecondary,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  Card {idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* LIVE BROADCAST CALLER SPHERE */}
      <CallerHUD
        currentCall={currentCall}
        totalCalls={drawnNumbers.length}
        maxCalls={25}
        recentCalls={recentCalls}
      />

      {/* PATTERN COMPLETED BANNER OVERLAY */}
      <PatternCompletedBanner
        visible={!!lastCompletedPatternName}
        patternName={lastCompletedPatternName || ''}
      />

      {/* CLAIM FEEDBACK BANNER */}
      {claimFeedback && (
        <View
          style={[
            styles.feedbackBanner,
            claimFeedback.success
              ? { backgroundColor: 'rgba(255, 122, 0, 0.12)', borderColor: COLORS.primaryOrange }
              : { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' },
          ]}
        >
          {claimFeedback.success ? <CheckIcon size={16} color={COLORS.primaryOrange} /> : <CloseIcon size={16} color="#EF4444" />}
          <Text style={[styles.feedbackText, { color: claimFeedback.success ? COLORS.primaryOrange : '#DC2626' }]}>
            {claimFeedback.message}
          </Text>
        </View>
      )}

      {/* 5x5 BINGO MATRIX CARD */}
      <BingoMatrixCard
        board={currentBoard}
        calledNumbersSet={calledNumbersSet}
        lastDrawnNumber={currentCall}
        onCellPress={(cell) => onCellPress(cell, activeBoardIdx)}
        boardIndex={activeBoardIdx}
        totalBoards={allBoards.length}
        activeStreak={linesCompletedCount >= 2 ? 2 : 1}
      />

      {/* CENTRAL TACTILE BINGO TRIGGER BUTTON */}
      <View style={styles.centerBingoRow}>
        <TouchableOpacity
          style={[
            styles.giantBingoBtn,
            linesCompletedCount > 0 && styles.giantBingoBtnGlow,
            {
              transform: [{ scale: isBingoPressed ? SPRING_CONFIGS.cardPress.scaleDown : 1 }],
            },
          ]}
          onPressIn={() => setIsBingoPressed(true)}
          onPressOut={() => setIsBingoPressed(false)}
          onPress={onClaimBingo}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Claim Bingo Victory"
        >
          <View style={styles.bingoBtnBevel} />
          <Text style={styles.giantBingoText}>✦ BINGO! ✦</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: 40,
    width: '100%',
    alignSelf: 'center',
  },
  hudBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.hero,
    borderWidth: 1,
    marginBottom: SPACING.xs,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    gap: 6,
  },
  hudBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.borderSpecularStrong,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 2,
    flexShrink: 0,
  },
  exitText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  hudScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    flexShrink: 1,
  },
  statBox: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 1,
  },
  linesBox: {
    paddingHorizontal: 8,
  },
  opponentBox: {
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  linesValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  opponentLinesValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 2,
    flexShrink: 0,
  },
  pauseText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cardTabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  cardTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  cardTabText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    marginVertical: SPACING.xs,
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  centerBingoRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  topTurnBanner: {
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.compact,
    marginBottom: SPACING.xs,
    width: '100%',
  },
  topTurnText: {
    fontFamily: TYPOGRAPHY.brandFamily,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  giantBingoBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primaryOrange,
    borderRadius: RADIUS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#E06900',
  },
  bingoBtnBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  giantBingoBtnGlow: {
    backgroundColor: '#E06900',
    shadowColor: COLORS.primaryOrange,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  giantBingoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: TYPOGRAPHY.brandFamily,
  },
});
