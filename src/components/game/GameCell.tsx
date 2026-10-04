import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GridCell5x5 } from '../../domain/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SPACING, TOUCH_TARGET, TYPOGRAPHY } from '../../design/tokens';
import { BingoIdentityIcon, MarkIcon } from '../icons/CustomIcons';
import { useTheme } from '../../design/theme';

interface GameCellProps {
  cell: GridCell5x5;
  isCalled: boolean;
  cellSize: number;
  onPress: (cell: GridCell5x5) => void;
}

export const GameCell: React.FC<GameCellProps> = React.memo(
  ({ cell, isCalled, cellSize, onPress }) => {
    const { theme } = useTheme();
    const [isPressed, setIsPressed] = useState(false);
    const isMarked = cell.state === 'MARKED' || cell.state === 'COMPLETED';
    const isFree = cell.isFreeSpace;
    const isWinning = cell.isWinningCell;

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
    }, []);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
    }, []);

    const getBgColor = () => {
      if (isWinning) return COLORS.winterHazel;
      if (isFree) return theme.accentHazelTint;
      if (isMarked) return COLORS.gentleOlive;
      if (isCalled) return theme.accentOliveTint;
      return theme.isDark ? '#22252A' : '#F5F5F5';
    };

    const getBorderColor = () => {
      if (isWinning) return COLORS.winterHazel;
      if (isFree) return COLORS.winterHazel;
      if (isMarked) return COLORS.gentleOlive;
      if (isCalled) return COLORS.gentleOlive;
      return theme.borderSubtle;
    };

    const targetDimension = Math.max(cellSize, TOUCH_TARGET.minSize);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(cell)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.cell,
          {
            width: targetDimension,
            height: targetDimension,
            backgroundColor: getBgColor(),
            borderColor: getBorderColor(),
            transform: [
              { scale: isPressed ? 0.96 : 1 },
              { translateY: isPressed ? 1 : 0 },
            ],
          },
          isWinning && styles.winningCellShadow,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Number ${cell.isFreeSpace ? 'Free center star' : cell.value}, ${
          isWinning
            ? 'Winning line cell'
            : isMarked
            ? 'Daubed'
            : isCalled
            ? 'Called ball ready to mark'
            : 'Uncalled'
        }`}
        accessibilityState={{
          selected: isMarked,
          disabled: false,
        }}
      >
        {/* Top Specular Edge Highlight */}
        <View style={styles.topBevel} />

        {/* Tabular Monospace Game Numeral or Center Bingo Emblem */}
        {cell.isFreeSpace ? (
          <BingoIdentityIcon
            size={Math.round(targetDimension * 0.42)}
            color={COLORS.winterHazel}
            variant="filled"
          />
        ) : (
          <Text
            style={[
              styles.cellText,
              {
                color: isWinning
                  ? COLORS.lunarShadow
                  : isMarked
                  ? COLORS.lunarShadow
                  : isCalled
                  ? theme.isDark
                    ? COLORS.gentleOlive
                    : '#3B4A0E'
                  : theme.textPrimary,
                fontWeight: isMarked || isWinning || isCalled ? '800' : '600',
              },
            ]}
          >
            {cell.value}
          </Text>
        )}

        {/* Stamped Wax Daub Seal with Core Pip */}
        {isMarked && !isFree && (
          <View style={styles.daubSeal}>
            <MarkIcon size={11} color={COLORS.lunarShadow} />
          </View>
        )}

        {/* Winning Gold Vector Pin */}
        {isWinning && (
          <View style={styles.winningIndicator}>
            <View style={styles.winningPip} />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  cell: {
    borderRadius: RADIUS.control, // 12px
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cellText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  daubSeal: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winningCellShadow: {
    shadowColor: COLORS.winterHazel,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  winningIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  winningPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lunarShadow,
  },
});
