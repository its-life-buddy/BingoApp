import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { PlayerProfile } from '../domain/types';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/design/tokens';
import { CheckIcon, TrophyIcon, Icon, IconName, RankIcon, EditPencilIcon } from '../components/icons/CustomIcons';
import { StreakBarChart } from '../components/common/StreakBarChart';
import { useTheme } from '../design/theme';
import { leaderboardService } from '../domain/services/leaderboardService';
import { globalModerationService } from '../domain/services/moderationService';

type ProfileSection = 'Overview' | 'Achievements' | 'Match History';

interface ProfileScreenProps {
  playerId?: string;
  playerName?: string;
  rating?: number;
  tier?: string;
  coins?: number;
  gems?: number;
  onUpdateName?: (name: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onNavigateDeleteAccount?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  playerId = 'player-local',
  playerName = 'Player_One',
  rating = 1000,
  tier = 'Bronze',
  onUpdateName,
  onLogout,
  onNavigateDeleteAccount,
}) => {
  const { theme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState<ProfileSection>('Overview');
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      const filterRes = globalModerationService.filterContent(trimmed);
      if (filterRes.isObjectionable) {
        Alert.alert(
          'Name Rejected',
          `The display name contains prohibited content: ${filterRes.reason || 'Please choose a respectful name.'}`
        );
        return;
      }
      
      setIsEditingName(false);
      
      // Optimistically update local profile state
      setProfile((prev) => ({ ...prev, name: trimmed, avatar: trimmed.slice(0, 2).toUpperCase() }));

      // Update database FIRST
      await leaderboardService.updatePlayerName(playerId, trimmed);
      
      // Then trigger upstream App state
      onUpdateName?.(trimmed);
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile>({
    id: playerId,
    name: playerName,
    avatar: playerName.slice(0, 2).toUpperCase(),
    tier: tier,
    rating: rating,
    gamesPlayed: 0,
    wins: 0,
    winRate: 0,
    bestStreak: 0,
    currentStreak: 0,
    achievements: [
      { id: 'a1', title: 'First Victory', description: 'Win your first 5×5 Bingo match', unlocked: true, icon: 'trophy' },
      { id: 'a2', title: 'Triple Threat', description: 'Complete 3 lines in a single match', unlocked: true, icon: 'ranked' },
      { id: 'a3', title: 'Corner Master', description: 'Complete the four corners pattern', unlocked: false, icon: 'bingo' },
      { id: 'a4', title: 'Grandmaster Clash', description: 'Defeat the Grandmaster Robot AI', unlocked: false, icon: 'winner' },
    ],
    recentMatches: [],
  });

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      const data = await leaderboardService.getPlayerProfile(playerId);
      if (mounted && data) {
        const p = data.profile || {};
        const history = data.history || [];
        
        const wins = history.filter((m: any) => m.result === 'WIN').length;
        const gamesPlayed = history.length;
        const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

        let currentStreak = 0;
        let bestStreak = 0;
        let streak = 0;
        
        // Calculate streaks (history is ordered by recent first, so we reverse it or just iterate from back)
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].result === 'WIN') {
            streak++;
            if (streak > bestStreak) bestStreak = streak;
          } else {
            streak = 0;
          }
        }
        currentStreak = streak; // The streak at the end (most recent)

        setProfile((prev) => ({
          ...prev,
          name: p.name || playerName,
          avatar: p.avatar || playerName.slice(0, 2).toUpperCase(),
          tier: p.tier || tier,
          rating: p.rating || rating,
          gamesPlayed,
          wins,
          winRate,
          bestStreak,
          currentStreak,
          recentMatches: history.map((m: any) => ({
            id: m.id,
            date: new Date(m.created_at).toLocaleDateString(),
            mode: m.mode || 'RANKED',
            result: m.result,
            score: m.score || 0,
            lines: m.lines || 0,
            ratingDelta: m.rating_delta || 0,
          })),
        }));
      }
      if (mounted) setIsLoading(false);
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, playerName]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgCanvas, justifyContent: 'center', alignItems: 'center', height: '100%' }]}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bgCanvas }]}
      showsVerticalScrollIndicator={false}
    >
      {/* PLAYER CREST (Clean, High-Craft, De-cluttered with Editable Name) */}
      <View
        style={[
          styles.crestCard,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: theme.bgRecessed,
              borderColor: COLORS.winterHazel,
            },
          ]}
        >
          <Text style={[styles.avatarInitials, { color: theme.textPrimary }]}>
            {profile.name.slice(0, 2).toUpperCase()}
          </Text>
          <View style={styles.onlineBadge} />
        </View>

        <View style={styles.identityDetails}>
          {isEditingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    color: theme.textPrimary,
                    backgroundColor: theme.bgRecessed,
                    borderColor: COLORS.winterHazel,
                  },
                ]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={18}
              />
              <View style={styles.editBtnGroup}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: COLORS.gentleOlive }]}
                  onPress={handleSaveName}
                  accessibilityRole="button"
                  accessibilityLabel="Save player name"
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => {
                    setNameInput(playerName);
                    setIsEditingName(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel name edit"
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameHeaderRow}>
              <Text style={[styles.playerName, { color: theme.textPrimary }]}>{profile.name}</Text>
              <TouchableOpacity
                style={[
                  styles.editPencilBtn,
                  { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle },
                ]}
                onPress={() => {
                  setNameInput(profile.name);
                  setIsEditingName(true);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Edit player profile name"
              >
                <EditPencilIcon size={13} color={COLORS.winterHazel} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.ratingRow}>
            <RankIcon size={13} color={COLORS.winterHazel} style={{ marginRight: 4 }} />
            <Text style={[styles.ratingValue, { color: theme.textPrimary }]}>
              {profile.rating.toLocaleString()}
            </Text>
            <Text style={[styles.ratingLabel, { color: theme.textMuted }]}>MMR</Text>
          </View>
        </View>
      </View>

      {/* 3-METRIC STATS KPI SHELF */}
      <View style={styles.kpiRow}>
        <View
          style={[
            styles.kpiCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
            {profile.wins}
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>TOTAL WINS</Text>
        </View>
        <View
          style={[
            styles.kpiCard,
            styles.kpiCardHighlight,
            {
              backgroundColor: theme.bgCard,
              borderColor: COLORS.primaryOrange,
            },
          ]}
        >
          <Text style={[styles.kpiValue, { color: COLORS.primaryOrange }]}>
            {profile.winRate}%
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>WIN RATE</Text>
        </View>
        <View
          style={[
            styles.kpiCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
            {profile.gamesPlayed}
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>MATCHES</Text>
        </View>
      </View>

      {/* SEGMENTED SECTION PILL FILTER */}
      <View
        style={[
          styles.sectionTabRow,
          {
            backgroundColor: theme.dockBg,
            borderColor: theme.dockBorder,
          },
        ]}
      >
        {(['Overview', 'Achievements', 'Match History'] as ProfileSection[]).map((sec) => {
          const isActive = activeSection === sec;
          return (
            <TouchableOpacity
              key={sec}
              style={[styles.sectionTab, isActive && styles.sectionTabActive]}
              onPress={() => setActiveSection(sec)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.sectionTabLabel,
                  isActive && styles.sectionTabLabelActive,
                ]}
              >
                {sec}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TAB CONTENT: OVERVIEW */}
      {activeSection === 'Overview' && (
        <View style={styles.tabContent}>
          {/* 7-Day Activity Bar Chart */}
          <StreakBarChart currentStreak={profile.bestStreak} totalWeekWins={profile.wins} />

          {/* Season Progression Track */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardHeader, { color: theme.textPrimary }]}>
                Season Progression
              </Text>
              <Text style={[styles.progressPercent, { color: COLORS.primaryOrange }]}>
                72.5%
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: isDark ? '#363A42' : '#F1F5F9' },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  { width: '72.5%', backgroundColor: COLORS.primaryOrange },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressSubtext, { color: theme.textSecondary }]}>
                Rank Tier Progress
              </Text>
              <Text style={[styles.progressSubtext, { color: theme.textMuted }]}>
                1,450 / 2,000 XP
              </Text>
            </View>
          </View>

          {/* Career Statistics */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.textPrimary, marginBottom: 12 }]}>
              Career Statistics
            </Text>

            <View style={styles.statRow}>
              <View style={styles.statRowLeft}>
                <View
                  style={[
                    styles.statIconSphere,
                    { backgroundColor: theme.accentOliveTint },
                  ]}
                >
                  <TrophyIcon size={16} color={COLORS.lunarShadow} />
                </View>
                <View>
                  <Text style={[styles.statRowTitle, { color: theme.textPrimary }]}>
                    Matches Won
                  </Text>
                  <Text style={[styles.statRowSub, { color: theme.textMuted }]}>
                    Competitive 5×5 victories
                  </Text>
                </View>
              </View>
              <Text style={[styles.statRowValue, { color: theme.textPrimary }]}>
                {profile.wins}
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statRowLeft}>
                <View
                  style={[
                    styles.statIconSphere,
                    { backgroundColor: theme.accentHazelTint },
                  ]}
                >
                  <TrophyIcon size={16} color={COLORS.winterHazel} />
                </View>
                <View>
                  <Text style={[styles.statRowTitle, { color: theme.textPrimary }]}>
                    Best Winning Streak
                  </Text>
                  <Text style={[styles.statRowSub, { color: theme.textMuted }]}>
                    Consecutive victories
                  </Text>
                </View>
              </View>
              <Text style={[styles.statRowValue, { color: COLORS.winterHazel }]}>
                {profile.bestStreak}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* TAB CONTENT: ACHIEVEMENTS */}
      {activeSection === 'Achievements' && (
        <View style={styles.tabContent}>
          {profile.achievements.map((ach) => {
            const isSelected = selectedAchievementId === ach.id;
            return (
              <TouchableOpacity
                key={ach.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: isSelected ? theme.bgRecessed : theme.bgCard,
                    borderColor: ach.unlocked
                      ? COLORS.gentleOlive
                      : isSelected
                      ? COLORS.winterHazel
                      : theme.borderSubtle,
                    borderWidth: isSelected || ach.unlocked ? 1.5 : 1,
                  },
                ]}
                onPress={() => setSelectedAchievementId(ach.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.achievementIconWrap,
                    {
                      backgroundColor: ach.unlocked
                        ? theme.accentOliveTint
                        : theme.bgRecessed,
                    },
                  ]}
                >
                  <Icon
                    name={ach.icon as IconName}
                    size={20}
                    color={ach.unlocked ? COLORS.lunarShadow : theme.textMuted}
                  />
                </View>
                <View style={styles.achievementMeta}>
                  <Text style={[styles.achievementTitle, { color: theme.textPrimary }]}>
                    {ach.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>
                    {ach.description}
                  </Text>
                </View>
                {ach.unlocked ? (
                  <View
                    style={[
                      styles.unlockedBadge,
                      { backgroundColor: theme.accentOliveTint },
                    ]}
                  >
                    <CheckIcon size={12} color={COLORS.lunarShadow} />
                    <Text style={[styles.unlockedText, { color: COLORS.lunarShadow }]}>
                      DONE
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.lockedBadge,
                      { backgroundColor: theme.bgSubtle },
                    ]}
                  >
                    <Text style={[styles.lockedText, { color: theme.textMuted }]}>
                      LOCKED
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* TAB CONTENT: MATCH HISTORY */}
      {activeSection === 'Match History' && (
        <View style={styles.tabContent}>
          {profile.recentMatches.map((m) => (
            <View
              key={m.id}
              style={[
                styles.historyCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.historyLeft}>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: theme.accentOliveTint },
                  ]}
                >
                  <Text style={[styles.resultBadgeText, { color: COLORS.lunarShadow }]}>
                    {m.result}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.historyMode, { color: theme.textPrimary }]}>
                    {m.mode} • {m.lines} Lines
                  </Text>
                  <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                    {m.date}
                  </Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={[styles.historyScore, { color: theme.textPrimary }]}>
                  {m.score.toLocaleString()} PTS
                </Text>
                {m.ratingDelta !== 0 && (
                  <Text style={[styles.ratingDelta, { color: COLORS.gentleOlive }]}>
                    +{m.ratingDelta} MMR
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* LOGOUT BUTTON */}
      {onLogout && (
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: theme.bgCard,
                borderColor: COLORS.dangerRed,
              },
            ]}
            onPress={onLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log out of account"
          >
            <Text style={[styles.logoutBtnText, { color: COLORS.dangerRed }]}>
              Log Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: COLORS.dangerRed,
                borderColor: COLORS.dangerRed,
                marginTop: SPACING.md,
              },
            ]}
            onPress={onNavigateDeleteAccount}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Delete Account"
          >
            <Text style={[styles.logoutBtnText, { color: COLORS.lunarShadow }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    paddingBottom: 120,
    width: '100%',
    alignSelf: 'center',
  },
  crestCard: {
    borderRadius: RADIUS.sheet, // 28px
    padding: SPACING.md, // 16px -> 12px for better fit
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md, // 12px
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: '100%',
    overflow: 'hidden',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.gentleOlive,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  identityDetails: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontFamily: TYPOGRAPHY.fontFamily,
    flexShrink: 1,
  },
  editPencilBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
    width: '100%',
  },
  editBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameInput: {
    flex: 1,
    minWidth: 110,
    height: 34,
    borderRadius: RADIUS.compact,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  saveBtn: {
    paddingHorizontal: 10,
    height: 34,
    borderRadius: RADIUS.compact,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cancelBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
    marginRight: 4,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
    width: '100%',
  },
  kpiCard: {
    flex: 1,
    borderRadius: RADIUS.surface, // 16px
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiCardHighlight: {
    borderWidth: 1.5,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  sectionTabRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.dock, // 28px
    padding: 3,
    borderWidth: 1,
    marginBottom: SPACING.md, // 12px
    gap: 3,
    width: '100%',
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  sectionTabActive: {
    backgroundColor: COLORS.primaryOrange, // Vibrant Orange active pill
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E94A0',
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  sectionTabLabelActive: {
    color: '#FFFFFF', // Crisp White
    fontWeight: '800',
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tabContent: {
    gap: SPACING.sm, // 8px
  },
  infoCard: {
    borderRadius: RADIUS.hero, // 24px
    padding: SPACING.lg, // 16px
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  progressTrack: {
    height: 7,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: RADIUS.pill,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  progressSubtext: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statIconSphere: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statRowSub: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  achievementCard: {
    borderRadius: RADIUS.surface, // 16px
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: SPACING.md,
  },
  achievementIconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementMeta: {
    flex: 1,
    gap: 2,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  achievementDesc: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  lockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  historyCard: {
    borderRadius: RADIUS.surface, // 16px
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.compact,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  historyMode: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  historyDate: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyScore: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  ratingDelta: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  logoutWrap: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
