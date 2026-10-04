/**
 * BingoMatrixCard
 * Apple HIG-Grade 5x5 Interactive Bingo Matrix Card Component
 * Supports 1 to 4 multi-card synchronized layout, fluid daub states,
 * streak multipliers, dauber stamps, concentric curvature, and touch-slop guards.
 * 100% Vector SVG Iconography (Zero Raw Emojis).
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
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
import { Board5x5, GridCell5x5 } from '../../domain/types';
import {
  BingoIdentityIcon,
  IconDaubStar,
  IconFire,
  IconSparkles,
  MarkIcon,
} from '../icons/CustomIcons';

export interface BingoMatrixCardProps {
  board: Board5x5;
  calledNumbersSet: Set<number>;
  lastDrawnNumber?: number;
  onCellPress: (cell: GridCell5x5, boardIndex?: number) => void;
  boardIndex?: number;
  totalBoards?: number;
  activeStreak?: number; // 0, 1, 2, 3+
  maxWidth?: number;
  isCompact?: boolean;
  style?: ViewStyle;
}

export const BingoMatrixCard: React.FC<BingoMatrixCardProps> = React.memo(({
  board,
  calledNumbersSet,
  lastDrawnNumber,
  onCellPress,
  boardIndex = 0,
  totalBoards = 1,
  activeStreak = 0,
  maxWidth = 380,
  isCompact = false,
  style,
}) => {
  const { theme } = useTheme();

  // Multi-touch rate-limiting guard (60ms lock to avoid race conditions)
  const lastTouchTimeRef = useRef<number>(0);

  const { width: windowWidth } = useWindowDimensions();

  // Concentric metrics
  const trayOuterRadius = RADIUS.board; // 24px
  const trayPadding = isCompact ? SPACING.xs + 2 : Math.min(SPACING.md, Math.max(8, windowWidth * 0.025));
  const cellRadius = calcConcentricRadius(trayOuterRadius, trayPadding, 8);

  // Responsive cell size calculation based on actual screen and card width
  const targetCardWidth = Math.min(maxWidth, windowWidth - SPACING.md * 2, 420);
  const availableWidth = targetCardWidth - trayPadding * 2;
  const gapBetweenCells = Math.min(SPACING.xs, Math.max(3, Math.floor(availableWidth * 0.015)));
  const rawCellSize = Math.floor((availableWidth - 4 * gapBetweenCells) / 5);
  const cellSize = Math.min(Math.max(rawCellSize, 32), 64);

  const handleCellTap = useCallback(
    (cell: GridCell5x5) => {
      const now = Date.now();
      if (now - lastTouchTimeRef.current < 60) {
        return; // Guard against multi-touch bounce / rapid multi-finger spam
      }
      lastTouchTimeRef.current = now;
      onCellPress(cell, boardIndex);
    },
    [onCellPress, boardIndex]
  );

  return (
    <View
      style={[
        styles.tray,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.borderSubtle,
          borderRadius: trayOuterRadius,
          padding: trayPadding,
        },
        style,
      ]}
      accessibilityRole="grid"
      accessibilityLabel={`Bingo Card ${boardIndex + 1} of ${totalBoards}`}
    >
      {/* 1px Specular Top Bevel Edge */}
      <View style={styles.topBevel} />

      {/* Header Telemetry Bar */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeftGroup}>
          <View
            style={[
              styles.cardPill,
              {
                backgroundColor: 'rgba(255, 122, 0, 0.12)',
                borderColor: COLORS.primaryOrange,
              },
            ]}
          >
            <Text style={[styles.cardPillText, { color: COLORS.primaryOrange }]}>
              CARD {boardIndex + 1}
            </Text>
          </View>

          {/* Active Streak Multiplier Badge */}
          {activeStreak > 1 && (
            <View style={styles.streakBadge}>
              <IconFire size={12} color={COLORS.primaryOrange} />
              <Text style={[styles.streakText, { color: COLORS.primaryOrange }]}>{activeStreak}x STREAK</Text>
            </View>
          )}
        </View>

        <Text style={[styles.matrixTelemetry, { color: theme.textMuted }]}>
          5×5 GRID • TAP TO DAUB
        </Text>
      </View>

      {/* 5x5 Matrix Layout */}
      <View style={[styles.gridContainer, { gap: gapBetweenCells }]}>
        {board.matrix.map((row, rIdx) => (
          <View key={`r-${rIdx}`} style={[styles.gridRow, { gap: gapBetweenCells }]}>
            {row.map((cell) => {
              const isCalled = calledNumbersSet.has(cell.value);
              const isJustCalled = cell.value === lastDrawnNumber;
              const isMarked = cell.state === 'MARKED' || cell.state === 'COMPLETED';
              const isWinning = !!cell.isWinningCell;
              const isFree = cell.isFreeSpace;
              const isMissed = isCalled && !isMarked && !isFree && (cell.state === 'INVALID' || cell.state === 'DISABLED');

              return (
                <MatrixCellItem
                  key={cell.id}
                  cell={cell}
                  isCalled={isCalled}
                  isJustCalled={isJustCalled}
                  isMarked={isMarked}
                  isWinning={isWinning}
                  isFree={isFree}
                  isMissed={isMissed}
                  cellSize={cellSize}
                  cellRadius={cellRadius}
                  onPress={() => handleCellTap(cell)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

interface MatrixCellItemProps {
  cell: GridCell5x5;
  isCalled: boolean;
  isJustCalled: boolean;
  isMarked: boolean;
  isWinning: boolean;
  isFree: boolean;
  isMissed: boolean;
  cellSize: number;
  cellRadius: number;
  onPress: () => void;
}

const MatrixCellItem: React.FC<MatrixCellItemProps> = React.memo(({
  cell,
  isCalled,
  isJustCalled,
  isMarked,
  isWinning,
  isFree,
  isMissed,
  cellSize,
  cellRadius,
  onPress,
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Background and border styling according to tactile state hierarchy
  const getCellColors = () => {
    if (isWinning) {
      return {
        bg: COLORS.winterHazel,
        border: COLORS.winterHazel,
        textColor: COLORS.lunarShadow,
      };
    }
    if (isFree) {
      return {
        bg: theme.accentHazelTint,
        border: COLORS.winterHazel,
        textColor: COLORS.winterHazel,
      };
    }
    if (isMarked) {
      return {
        bg: COLORS.daubWell,
        border: COLORS.daubBorder,
        textColor: '#93C5FD',
      };
    }
    if (isJustCalled) {
      return {
        bg: theme.accentOliveTint,
        border: COLORS.gentleOlive,
        textColor: theme.isDark ? COLORS.gentleOlive : '#3B4A0E',
      };
    }
    if (isCalled) {
      return {
        bg: theme.accentOliveTint,
        border: COLORS.gentleOlive,
        textColor: theme.isDark ? COLORS.gentleOlive : '#3B4A0E',
      };
    }
    if (isMissed) {
      return {
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.25)',
        textColor: '#EF4444',
      };
    }
    return {
      bg: theme.isDark ? '#1C2028' : '#F1F5F9',
      border: theme.borderSubtle,
      textColor: theme.textPrimary,
    };
  };

  const colors = getCellColors();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[
        styles.cellItem,
        {
          width: cellSize,
          height: cellSize,
          borderRadius: cellRadius,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [{ scale: isPressed ? SPRING_CONFIGS.cardPress.scaleDown : 1 }],
        },
        isWinning && styles.winningCellElevation,
        isJustCalled && styles.justCalledPulsing,
        isMarked && styles.daubedCellElevation,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Cell ${isFree ? 'Free Center Star' : cell.value}, ${
        isWinning
          ? 'Winning Line Cell'
          : isMarked
          ? 'Daubed'
          : isCalled
          ? 'Called and Ready to Daub'
          : 'Uncalled'
      }`}
      accessibilityState={{ selected: isMarked }}
    >
      {/* 1px Top Specular Edge Highlight */}
      <View style={styles.cellBevel} />

      {/* Center FREE Emblem or Tabular Monospace Numeral */}
      {isFree ? (
        <BingoIdentityIcon
          size={Math.round(cellSize * 0.44)}
          color={COLORS.winterHazel}
          variant="filled"
        />
      ) : (
        <Text
          style={[
            styles.cellNumeral,
            {
              color: colors.textColor,
              fontWeight: isMarked || isWinning || isCalled ? '800' : '600',
              fontSize: cellSize > 42 ? 16 : 14,
            },
          ]}
        >
          {cell.value}
        </Text>
      )}

      {/* Dauber Wax Seal Stamp Overlay */}
      {isMarked && !isFree && (
        <View style={styles.daubStampBadge}>
          <IconDaubStar size={12} color="#3B82F6" />
        </View>
      )}

      {/* Winning Specular Glint Pin */}
      {isWinning && (
        <View style={styles.winningPip}>
          <IconSparkles size={10} color={COLORS.lunarShadow} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  tray: {
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: SPACING.xs,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.borderSpecularStrong,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  cardPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#F97316',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    gap: 3,
  },
  streakText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F97316',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  matrixTelemetry: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  gridContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  cellItem: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cellBevel: {
    position: 'absolute',
    top: 0,
    left: 3,
    right: 3,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  cellNumeral: {
    fontFamily: TYPOGRAPHY.monoFamily,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  daubStampBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winningPip: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  winningCellElevation: {
    shadowColor: COLORS.winterHazel,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  daubedCellElevation: {
    shadowColor: COLORS.daubBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  justCalledPulsing: {
    shadowColor: COLORS.gentleOlive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
});
