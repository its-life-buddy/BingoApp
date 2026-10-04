import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  RobotIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  PuzzleIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  UsersIcon,
} from '../icons/CustomIcons';
import { useTheme } from '../../design/theme';

interface LobbyGalleryProps {
  onPlayRanked?: () => void;
  onPlayRandomPlayer: () => void;
  onSoloPress: () => void;
  onDailyPress: () => void;
  // Optional backward compatibility props
  onFriendPress?: () => void;
  onOpenDailyBonusModal?: () => void;
  onOpenRoomSelection?: () => void;
  onlineCount?: number | null;
}

/**
 * LobbyGallery: Clean Rectangular Gallery with EXACTLY THREE playable options:
 * 1. Robot / Solo Practice
 * 2. Random Player (Real human 1v1 matchmaking)
 * 3. Daily Puzzle
 */
import { RandomPlayerCard } from '../bingo/RandomPlayerCard';
import { RobotPracticeCard } from '../bingo/RobotPracticeCard';
import { DailyPuzzleCard } from '../bingo/DailyPuzzleCard';

export const LobbyGallery: React.FC<LobbyGalleryProps> = ({
  onPlayRandomPlayer,
  onPlayRanked,
  onSoloPress,
  onDailyPress,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFriendPress,
  onlineCount = 1240,
}) => {
  const { theme } = useTheme();
  const handleRandomPlay = onPlayRandomPlayer || onPlayRanked || (() => {});

  return (
    <View style={styles.container}>
      {/* 1. REBUILT THREEUI HERO CARD: RANDOM PLAYER (MULTI-LAYERED WITH REAL STATE) */}
      <RandomPlayerCard
        state="IDLE"
        onlineCount={onlineCount}
        onFindPlayer={handleRandomPlay}
      />

      {/* 2. SECTION HEADER */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          PRACTICE & CHALLENGES
        </Text>
      </View>

      {/* 4. REBUILT TWO-COLUMN GALLERY: ROBOT PRACTICE & DAILY PUZZLE */}
      <View style={styles.galleryGridRow}>
        <RobotPracticeCard onPress={onSoloPress} selectedDifficulty="MEDIUM" />
        <DailyPuzzleCard onPress={onDailyPress} streakCount={3} />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm, // 8px
    gap: SPACING.sm, // 8px
  },
  heroCard: {
    borderRadius: RADIUS.control + 4, // 16px rectangular card
    padding: SPACING.md + 2, // 14px
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#A4B456',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  specularBevel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  playerCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
  },
  playerCountText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextGroup: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  heroSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  heroActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#8C9A3C',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  heroArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    marginTop: -2,
    marginLeft: 1,
  },
  sectionHeaderRow: {
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  galleryGridRow: {
    flexDirection: 'row',
    gap: SPACING.md, // 12px
  },
  galleryBox: {
    flex: 1,
    borderRadius: RADIUS.control + 2, // 14px rectangular box
    padding: SPACING.md, // 12px
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 108,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  boxTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  boxIconSphere: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  boxTagPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.compact,
    borderWidth: 0.5,
  },
  boxTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  boxActionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.compact,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActionPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
    marginTop: 4,
  },
  boxDesc: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  privateRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.control + 2,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#A4B456',
  },
  privateRoomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  privateRoomIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateRoomTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  privateRoomSub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  openRoomBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  openRoomBtnText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
  },
});
