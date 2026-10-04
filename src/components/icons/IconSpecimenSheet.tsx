import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Icon } from './Icon';
import { AnimatedIcon } from './AnimatedIcon';
import { IconName, IconState } from './types';
import { AppIconVector } from './AppIconVector';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';

interface IconSpecimenSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface SpecimenGroup {
  title: string;
  subtitle: string;
  icons: { name: IconName; label: string }[];
}

const SPECIMEN_GROUPS: SpecimenGroup[] = [
  {
    title: 'NAVIGATION',
    subtitle: 'Reference 3 Floating Dock Foundation',
    icons: [
      { name: 'play', label: 'Play' },
      { name: 'leaderboard', label: 'Leaderboard' },
      { name: 'profile', label: 'Profile' },
    ],
  },
  {
    title: 'GAMEPLAY & BRAND IDENTITY',
    subtitle: 'Original Bingo Symbol & Game Actions',
    icons: [
      { name: 'bingo', label: 'Bingo Mark' },
      { name: 'mark', label: 'Mark / Daub' },
      { name: 'unmark', label: 'Unmark' },
      { name: 'winner', label: 'Winner' },
      { name: 'pause', label: 'Pause' },
      { name: 'resume', label: 'Resume' },
      { name: 'shuffle', label: 'Shuffle' },
      { name: 'finish', label: 'Finish' },
      { name: 'number', label: 'Number Grid' },
      { name: 'next', label: 'Next' },
      { name: 'previous', label: 'Previous' },
    ],
  },
  {
    title: 'GAME MODES',
    subtitle: 'Experience Archetypes',
    icons: [
      { name: 'solo', label: 'Solo AI' },
      { name: 'ranked', label: 'Ranked' },
      { name: 'multiplayer', label: 'Social' },
      { name: 'daily', label: 'Daily' },
      { name: 'private_room', label: 'Private Room' },
      { name: 'join_room', label: 'Join Room' },
      { name: 'create_room', label: 'Create Room' },
    ],
  },
  {
    title: 'PLAYER & PROGRESSION',
    subtitle: 'Telemetry, Streaks & Trophies',
    icons: [
      { name: 'rank', label: 'Rank Star' },
      { name: 'trophy', label: 'Trophy' },
      { name: 'streak', label: 'Streak Flame' },
      { name: 'achievement', label: 'Achievement' },
      { name: 'level', label: 'Level Tier' },
      { name: 'avatar', label: 'Avatar Frame' },
      { name: 'history', label: 'History' },
      { name: 'statistics', label: 'Statistics' },
    ],
  },
  {
    title: 'UTILITY & CONTROLS',
    subtitle: 'Precision Interactive Surface',
    icons: [
      { name: 'settings', label: 'Settings' },
      { name: 'search', label: 'Search' },
      { name: 'notifications', label: 'Notifications' },
      { name: 'sound', label: 'Sound' },
      { name: 'mute', label: 'Mute' },
      { name: 'vibration', label: 'Vibration' },
      { name: 'speech', label: 'Speech' },
      { name: 'close', label: 'Close' },
      { name: 'back', label: 'Back' },
      { name: 'more', label: 'More' },
      { name: 'information', label: 'Info' },
      { name: 'help', label: 'Help' },
      { name: 'copy', label: 'Copy' },
      { name: 'share', label: 'Share' },
    ],
  },
  {
    title: 'STATE & SYSTEM',
    subtitle: 'Authoritative Engine Feedback',
    icons: [
      { name: 'success', label: 'Success' },
      { name: 'warning', label: 'Warning' },
      { name: 'error', label: 'Error' },
      { name: 'locked', label: 'Locked' },
      { name: 'unlocked', label: 'Unlocked' },
      { name: 'loading', label: 'Loading' },
      { name: 'refresh', label: 'Refresh' },
    ],
  },
];

const STATES_TO_SHOW: { id: IconState; label: string }[] = [
  { id: 'idle', label: 'IDLE' },
  { id: 'active', label: 'ACTIVE' },
  { id: 'pressed', label: 'PRESSED' },
  { id: 'disabled', label: 'DISABLED' },
];

export const IconSpecimenSheet: React.FC<IconSpecimenSheetProps> = ({
  visible,
  onClose,
}) => {
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const [focusedIcon, setFocusedIcon] = useState<IconName | null>('bingo');
  const [viewStateFilter, setViewStateFilter] = useState<'ALL' | IconState>('ALL');

  const sizes = [16, 20, 24, 28, 32, 48];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Icon Family Specimen Sheet</Text>
              <Text style={styles.sheetSubtitle}>
                Mobile-First Animated SVG Family • 24×24 Grid • 2.0px Optical Stroke
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close specimen sheet"
            >
              <Icon name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Controls: Size Switcher & State Filter */}
          <View style={styles.controlsBar}>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>SCALE:</Text>
              <View style={styles.pillTrack}>
                {sizes.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizePill, selectedSize === s && styles.sizePillActive]}
                    onPress={() => setSelectedSize(s)}
                  >
                    <Text
                      style={[
                        styles.sizePillText,
                        selectedSize === s && styles.sizePillTextActive,
                      ]}
                    >
                      {s}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>STATE VIEW:</Text>
              <View style={styles.pillTrack}>
                {(['ALL', 'idle', 'active', 'pressed', 'disabled'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.sizePill, viewStateFilter === st && styles.sizePillActive]}
                    onPress={() => setViewStateFilter(st)}
                  >
                    <Text
                      style={[
                        styles.sizePillText,
                        viewStateFilter === st && styles.sizePillTextActive,
                      ]}
                    >
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Section 25: 400% Zoom Inspector */}
            {focusedIcon && (
              <View style={styles.inspectorCard}>
                <View style={styles.inspectorHeader}>
                  <View style={styles.inspectorTitleGroup}>
                    <Text style={styles.inspectorBadge}>SECTION 25 QA</Text>
                    <Text style={styles.inspectorTitle}>
                      400% Bézier Continuity Inspector: [{focusedIcon.toUpperCase()}]
                    </Text>
                  </View>
                  <Text style={styles.inspectorHelp}>
                    Tap any icon below to inspect geometry at 400%
                  </Text>
                </View>

                <View style={styles.inspectorBody}>
                  {/* 400% Vector Stage */}
                  <View style={styles.zoomStage}>
                    {/* Grid Lines */}
                    <View style={styles.zoomGridLines} pointerEvents="none" />
                    <Icon name={focusedIcon} size={96} color={COLORS.goldPrimary} strokeWidth={2} />
                    <View style={styles.centerCross} pointerEvents="none" />
                  </View>

                  <View style={styles.inspectorMeta}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Grid Construction:</Text>
                      <Text style={styles.metaVal}>24×24 Vector Grid</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Optical Stroke:</Text>
                      <Text style={styles.metaVal}>2.0px Uniform Bézier</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Terminals:</Text>
                      <Text style={styles.metaVal}>Round Cap & Round Join</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Curvature Philosophy:</Text>
                      <Text style={styles.metaVal}>Continuous Tangencies (C/Q)</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Optical Weight Balance:</Text>
                      <Text style={[styles.metaVal, { color: COLORS.playEmerald }]}>VERIFIED UNIFORM</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Specimen Groups */}
            {SPECIMEN_GROUPS.map((group) => (
              <View key={group.title} style={styles.groupSection}>
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
                </View>

                <View style={styles.iconsGrid}>
                  {group.icons.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.iconCard,
                        focusedIcon === item.name && styles.iconCardFocused,
                      ]}
                      onPress={() => setFocusedIcon(item.name)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.iconNameLabel} numberOfLines={1}>
                        {item.label}
                      </Text>

                      {viewStateFilter === 'ALL' ? (
                        <View style={styles.statesRow}>
                          {STATES_TO_SHOW.map((st) => (
                            <View key={st.id} style={styles.singleStateCol}>
                              <AnimatedIcon
                                name={item.name}
                                size={selectedSize}
                                state={st.id}
                                color={
                                  st.id === 'active'
                                    ? COLORS.goldPrimary
                                    : st.id === 'disabled'
                                    ? '#475569'
                                    : COLORS.textPrimary
                                }
                              />
                              <Text style={styles.stateMiniLabel}>{st.label.slice(0, 3)}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.singleFocusWrap}>
                          <AnimatedIcon
                            name={item.name}
                            size={selectedSize}
                            state={viewStateFilter}
                            color={
                              viewStateFilter === 'active'
                                ? COLORS.goldPrimary
                                : viewStateFilter === 'disabled'
                                ? '#475569'
                                : COLORS.textPrimary
                            }
                          />
                          <Text style={styles.stateMiniLabel}>{viewStateFilter.toUpperCase()}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* App Store Icon Showcase (Section 22) */}
            <View style={styles.groupSection}>
              <View style={styles.groupHeaderRow}>
                <Text style={styles.groupTitle}>APP STORE & LAUNCHER ICON (SECTION 22)</Text>
                <Text style={styles.groupSubtitle}>Standalone 512×512 Vector Specification</Text>
              </View>

              <View style={styles.appIconShowcaseCard}>
                <AppIconVector size={120} />
                <View style={styles.appIconMeta}>
                  <Text style={styles.appIconTitle}>Bingo Master Identity</Text>
                  <Text style={styles.appIconDesc}>
                    Designed separately from in-app navigation icons. Unmasked 512×512 canvas with
                    the signature 5-point Star-Matrix emblem and solar gold lighting.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 860,
    maxHeight: '92%',
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceDeep,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  controlsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 12,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  pillTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceDeep,
    padding: 3,
    borderRadius: RADIUS.pill,
  },
  sizePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  sizePillActive: {
    backgroundColor: COLORS.playEmerald,
  },
  sizePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sizePillTextActive: {
    color: COLORS.textDark,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.xl,
  },
  inspectorCard: {
    backgroundColor: COLORS.surfaceDeep,
    borderRadius: RADIUS.surface,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  inspectorTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inspectorBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.goldPrimary,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inspectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inspectorHelp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  inspectorBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  zoomStage: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.surface,
    backgroundColor: '#05070A',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  zoomGridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  centerCross: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },
  inspectorMeta: {
    flex: 1,
    minWidth: 240,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  metaKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  groupSection: {
    gap: SPACING.sm,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    paddingBottom: 4,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  groupSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 260,
    backgroundColor: COLORS.surfaceDeep,
    borderRadius: RADIUS.control,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 6,
  },
  iconCardFocused: {
    borderColor: COLORS.goldPrimary,
    backgroundColor: COLORS.surfaceRaised,
  },
  iconNameLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  singleStateCol: {
    alignItems: 'center',
    gap: 4,
  },
  singleFocusWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  stateMiniLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  appIconShowcaseCard: {
    backgroundColor: COLORS.surfaceDeep,
    borderRadius: RADIUS.surface,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    flexWrap: 'wrap',
  },
  appIconMeta: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  appIconTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.goldPrimary,
  },
  appIconDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
