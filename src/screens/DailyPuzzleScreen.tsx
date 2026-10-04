import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { RouteHeader } from '../components/common/RouteHeader';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CalendarIcon, CheckIcon } from '../components/icons/CustomIcons';
import { useTheme } from '../design/theme';

interface DailyPuzzleScreenProps {
  onStartDaily: (seed: string) => void;
  onBack: () => void;
}

export const DailyPuzzleScreen: React.FC<DailyPuzzleScreenProps> = ({ onStartDaily, onBack }) => {
  const { theme } = useTheme();
  const today = new Date().toISOString().slice(0, 10);
  const [isCompleted] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      <RouteHeader title="Daily Puzzle" onBack={onBack} />

      <View style={styles.content}>
        <View
          style={[
            styles.calendarBadge,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View
            style={[
              styles.calendarIconCircle,
              { backgroundColor: theme.accentHazelTint },
            ]}
          >
            <CalendarIcon size={24} color={COLORS.winterHazel} />
          </View>
          <Text style={[styles.calendarDate, { color: theme.textPrimary }]}>{today}</Text>
          <Text style={[styles.puzzleNumber, { color: COLORS.gentleOlive }]}>
            24-HOUR CHALLENGE CYCLE
          </Text>
        </View>

        <View
          style={[
            styles.rulesCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.rulesTitle, { color: theme.textSecondary }]}>
            Daily Constraints & Rules
          </Text>
          <Text style={[styles.ruleItem, { color: theme.textPrimary }]}>
            • Deterministic 5×5 board seeded for this 24-hour cycle
          </Text>
          <Text style={[styles.ruleItem, { color: theme.textPrimary }]}>
            • Objective: Form at least 2 completed lines in under 16 calls
          </Text>
          <Text style={[styles.ruleItem, { color: theme.textPrimary }]}>
            • One official completion recorded per calendar day
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.startBtn,
            {
              backgroundColor: isCompleted ? theme.bgSubtle : COLORS.gentleOlive,
              borderColor: isCompleted ? theme.borderSubtle : '#D7E28E',
            },
          ]}
          disabled={isCompleted}
          onPress={() => onStartDaily(`daily-${today}`)}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Start today's puzzle"
        >
          <Text
            style={[
              styles.startBtnText,
              { color: isCompleted ? theme.textMuted : COLORS.lunarShadow },
            ]}
          >
            {isCompleted ? 'COMPLETED TODAY' : "START TODAY'S PUZZLE ↗"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg, // 16px
    alignItems: 'center',
    gap: SPACING.md, // 12px
  },
  calendarBadge: {
    borderRadius: RADIUS.hero, // 24px
    paddingVertical: SPACING.lg, // 16px
    paddingHorizontal: SPACING.xl, // 20px
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calendarDate: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  puzzleNumber: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  rulesCard: {
    borderRadius: RADIUS.hero, // 24px
    padding: SPACING.lg, // 16px
    width: '100%',
    borderWidth: 1,
    gap: SPACING.sm, // 8px
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  ruleItem: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  startBtn: {
    width: '100%',
    borderRadius: RADIUS.sheet, // 28px
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: COLORS.gentleOlive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: SPACING.xs,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
