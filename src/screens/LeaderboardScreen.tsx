import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LeaderboardEntry, Player } from '../domain/types';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TrophyIcon, RankIcon, CheckIcon } from '../components/icons/CustomIcons';
import { useTheme } from '../design/theme';
import { leaderboardService } from '../domain/services/leaderboardService';
import { InlineLoader } from '../components/common/InlineLoader';

export type PeriodFilter = 'Daily' | 'Weekly' | 'All Time';

interface LeaderboardScreenProps {
  player: Player;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ player }) => {
  const { theme, isDark } = useTheme();
  const [period, setPeriod] = useState<PeriodFilter>('Weekly');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(player.id);
  const [rankedPlayers, setRankedPlayers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    
    const loadLeaderboard = async () => {
      setIsLoading(true);
      // Upsert current player first so they appear in the fetch
      await leaderboardService.upsertPlayer(player);
      
      const players = await leaderboardService.fetchTopPlayers(player.id, period);
      
      if (mounted) {
        setRankedPlayers(players);
        setIsLoading(false);
      }
    };

    loadLeaderboard();

    return () => {
      mounted = false;
    };
  }, [player, period]);

  const topThree = rankedPlayers.slice(0, 3);
  const remainingPlayers = rankedPlayers.slice(3);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      {/* HEADER & FILTER */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.trophyIconWrap,
              { backgroundColor: theme.accentOliveTint, borderColor: COLORS.primaryOrange },
            ]}
          >
            <CheckIcon size={20} color={COLORS.primaryOrange} />
          </View>
          <View>
            <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
              Season Leaderboard
            </Text>
            <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
              Official Global Competitive Rankings
            </Text>
          </View>
        </View>

        {/* Tactile Segmented Period Filter */}
        <View
          style={[
            styles.filterRow,
            { backgroundColor: theme.dockBg, borderColor: theme.dockBorder },
          ]}
        >
          {(['Daily', 'Weekly', 'All Time'] as PeriodFilter[]).map((tab) => {
            const isActive = period === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                ]}
                onPress={() => setPeriod(tab)}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isActive && styles.filterLabelActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center', gap: SPACING.md }}>
            <InlineLoader size={24} color={COLORS.winterHazel} />
            <Text style={{ color: theme.textMuted, fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600' }}>
              SYNCING LIVE RANKS...
            </Text>
          </View>
        )}

        {/* ARCHITECTURAL 3-STEP SEASON PODIUM */}
        {!isLoading && topThree.length >= 3 && (
          <View
            style={[
              styles.podiumContainer,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.podiumHeaderRow}>
              <Text style={[styles.podiumHeader, { color: theme.textMuted }]}>
                SEASON PODIUM
              </Text>
              <View
                style={[
                  styles.liveIndicator,
                  { backgroundColor: theme.accentOliveTint },
                ]}
              >
                <View style={styles.livePip} />
                <Text style={styles.liveText}>TIER 1 ELITE</Text>
              </View>
            </View>

            <View style={styles.podiumStage}>
              {/* RANK 2 - SILVER (LEFT) */}
              <TouchableOpacity
                style={styles.podiumColWrapper}
                onPress={() => setSelectedPlayerId(topThree[1].id)}
                activeOpacity={0.85}
              >
                {/* Avatar & Floating Crown */}
                <View style={styles.avatarHolder}>
                  <View style={[styles.avatarSilverRing, { backgroundColor: theme.bgRecessed }]}>
                    <Text style={[styles.avatarInitials, { color: theme.textPrimary }]}>
                      {topThree[1].avatar}
                    </Text>
                  </View>
                  <View style={styles.silverBadge}>
                    <Text style={styles.badgeNumber}>2</Text>
                  </View>
                </View>

                {/* Player Name & Score */}
                <Text style={[styles.podiumPlayerName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {topThree[1].name}
                </Text>
                <View style={[styles.ratingPill, { backgroundColor: theme.bgRecessed }]}>
                  <RankIcon size={11} color={COLORS.winterHazel} style={{ marginRight: 3 }} />
                  <Text style={[styles.ratingPillScore, { color: theme.textPrimary }]}>
                    {topThree[1].rating}
                  </Text>
                </View>

                {/* Pedestal Step Column */}
                <View
                  style={[
                    styles.pedestalStep,
                    styles.pedestalSilver,
                    {
                      backgroundColor: isDark ? '#2D323B' : '#E2E8F0',
                      borderColor: '#94A3B8',
                    },
                  ]}
                >
                  <Text style={styles.pedestalRoman}>II</Text>
                  <Text style={[styles.pedestalWinRate, { color: theme.textMuted }]}>
                    {topThree[1].winRate}% WR
                  </Text>
                </View>
              </TouchableOpacity>

              {/* RANK 1 - GOLD (CENTER CHAMPION) */}
              <TouchableOpacity
                style={[styles.podiumColWrapper, styles.podiumCenterWrapper]}
                onPress={() => setSelectedPlayerId(topThree[0].id)}
                activeOpacity={0.85}
              >
                {/* Avatar & Floating Gold Crown */}
                <View style={styles.avatarHolder}>
                  <View style={[styles.avatarGoldRing, { backgroundColor: theme.bgRecessed }]}>
                    <Text style={[styles.avatarInitialsGold, { color: COLORS.primaryOrange }]}>
                      {topThree[0].avatar}
                    </Text>
                  </View>
                  <View style={styles.goldBadge}>
                    <Text style={styles.goldBadgeNumber}>1</Text>
                  </View>
                </View>

                {/* Player Name & Score */}
                <Text style={[styles.podiumPlayerName, styles.goldPlayerName]} numberOfLines={1}>
                  {topThree[0].name}
                </Text>
                <View
                  style={[
                    styles.ratingPill,
                    styles.ratingPillGold,
                    { backgroundColor: theme.accentHazelTint, borderColor: COLORS.winterHazel },
                  ]}
                >
                  <RankIcon size={12} color={COLORS.winterHazel} style={{ marginRight: 4 }} />
                  <Text style={[styles.ratingPillScore, { color: COLORS.primaryOrange }]}>
                    {topThree[0].rating}
                  </Text>
                </View>

                {/* Pedestal Step Column - Elevated Tallest */}
                <View
                  style={[
                    styles.pedestalStep,
                    styles.pedestalGold,
                    {
                      backgroundColor: isDark ? '#3D3425' : '#FFF0DB',
                      borderColor: COLORS.primaryOrange,
                    },
                  ]}
                >
                  <View style={styles.pedestalShine} />
                  <Text style={[styles.pedestalRoman, { color: '#B45309' }]}>I</Text>
                  <Text style={[styles.pedestalWinRate, { color: '#92400E' }]}>
                    {topThree[0].winRate}% WR
                  </Text>
                </View>
              </TouchableOpacity>

              {/* RANK 3 - BRONZE (RIGHT) */}
              <TouchableOpacity
                style={styles.podiumColWrapper}
                onPress={() => setSelectedPlayerId(topThree[2].id)}
                activeOpacity={0.85}
              >
                {/* Avatar & Floating Bronze Crown */}
                <View style={styles.avatarHolder}>
                  <View style={[styles.avatarBronzeRing, { backgroundColor: theme.bgRecessed }]}>
                    <Text style={[styles.avatarInitials, { color: theme.textPrimary }]}>
                      {topThree[2].avatar}
                    </Text>
                  </View>
                  <View style={styles.bronzeBadge}>
                    <Text style={styles.badgeNumber}>3</Text>
                  </View>
                </View>

                {/* Player Name & Score */}
                <Text style={[styles.podiumPlayerName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {topThree[2].name}
                </Text>
                <View style={[styles.ratingPill, { backgroundColor: theme.bgRecessed }]}>
                  <RankIcon size={11} color={COLORS.winterHazel} style={{ marginRight: 3 }} />
                  <Text style={[styles.ratingPillScore, { color: theme.textPrimary }]}>
                    {topThree[2].rating}
                  </Text>
                </View>

                {/* Pedestal Step Column */}
                <View
                  style={[
                    styles.pedestalStep,
                    styles.pedestalBronze,
                    {
                      backgroundColor: isDark ? '#332720' : '#FFEDD5',
                      borderColor: '#B45309',
                    },
                  ]}
                >
                  <Text style={[styles.pedestalRoman, { color: '#9A3412' }]}>III</Text>
                  <Text style={[styles.pedestalWinRate, { color: theme.textMuted }]}>
                    {topThree[2].winRate}% WR
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CONTINUING RANKINGS */}
        {!isLoading && (
          <>
            <View style={styles.listContainer}>
              <View style={styles.sectionHeaderRow}>
              <Text style={[styles.listSectionTitle, { color: theme.textMuted }]}>
                CONTINUING RANKINGS
            </Text>
            <Text style={[styles.tierHeaderSubtitle, { color: theme.textMuted }]}>
              UPDATED LIVE
            </Text>
          </View>

          {remainingPlayers.map((item) => {
            const isSelected = selectedPlayerId === item.id;
            const isSelf = item.isCurrentUser;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: isSelf
                      ? isDark
                        ? '#22281E'
                        : '#F3F8E4'
                      : isSelected
                      ? theme.bgRecessed
                      : theme.bgCard,
                    borderColor: isSelf
                      ? COLORS.gentleOlive
                      : isSelected
                      ? COLORS.winterHazel
                      : theme.borderSubtle,
                    borderWidth: isSelf || isSelected ? 1.5 : 1,
                  },
                ]}
                onPress={() => setSelectedPlayerId(item.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Rank ${item.rank}, ${item.name}, ${item.rating} points`}
              >
                {/* Rank Number Capsule */}
                <View
                  style={[
                    styles.rankBox,
                    {
                      backgroundColor: isSelf
                        ? COLORS.gentleOlive
                        : theme.bgRecessed,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.listRankText,
                      {
                        color: isSelf ? COLORS.lunarShadow : theme.textMuted,
                      },
                    ]}
                  >
                    {String(item.rank).padStart(2, '0')}
                  </Text>
                </View>

                {/* Avatar */}
                <View
                  style={[
                    styles.listAvatar,
                    {
                      backgroundColor: isSelf ? COLORS.gentleOlive : theme.bgRecessed,
                      borderColor: isSelf ? COLORS.winterHazel : theme.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.listAvatarInitials,
                      {
                        color: isSelf ? COLORS.lunarShadow : theme.textPrimary,
                      },
                    ]}
                  >
                    {item.avatar}
                  </Text>
                </View>

                {/* Player Metadata */}
                <View style={styles.listMeta}>
                  <View style={styles.nameContainer}>
                    <Text
                      style={[
                        styles.listName,
                        { color: theme.textPrimary },
                        isSelf && styles.currentUserName,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelf && (
                      <View style={[styles.youTag, { backgroundColor: COLORS.gentleOlive }]}>
                        <Text style={styles.youTagText}>YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.listTier, { color: theme.textSecondary }]}>
                    {item.tier} • {item.wins} Wins • {item.winRate}% WR
                  </Text>
                </View>

                {/* Rating Score Pill */}
                <View
                  style={[
                    styles.listScorePill,
                    {
                      backgroundColor: isSelf
                        ? 'rgba(203, 215, 126, 0.35)'
                        : theme.bgRecessed,
                      borderColor: isSelf ? COLORS.gentleOlive : theme.borderSubtle,
                    },
                  ]}
                >
                  <RankIcon size={12} color={COLORS.winterHazel} style={{ marginRight: 4 }} />
                  <Text style={[styles.listRating, { color: theme.textPrimary }]}>
                    {item.rating.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FREE FIRE STYLE ESPORTS COMBAT DOSSIER */}
        {(() => {
          const selectedPlayer =
            rankedPlayers.find((p) => p.id === selectedPlayerId) || rankedPlayers[0];
          if (!selectedPlayer) return null;

          return (
            <View
              style={[
                styles.dossierCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor:
                    selectedPlayer.rank === 1
                      ? COLORS.winterHazel
                      : selectedPlayer.isCurrentUser
                      ? COLORS.gentleOlive
                      : theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.dossierHeader}>
                <View
                  style={[
                    styles.dossierBadge,
                    {
                      backgroundColor: COLORS.primaryOrange,
                    },
                  ]}
                >
                  <Text style={[styles.dossierRankTag, { color: '#FFFFFF' }]}>
                    RANK #{selectedPlayer.rank} • {selectedPlayer.tier.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.dossierLiveText, { color: theme.textMuted }]}>
                  HEROIC COMBAT INSPECTOR
                </Text>
              </View>

              <View style={styles.dossierProfileRow}>
                <View
                  style={[
                    styles.dossierAvatarSphere,
                    {
                      backgroundColor: theme.bgRecessed,
                      borderColor:
                        selectedPlayer.rank === 1
                          ? COLORS.winterHazel
                          : COLORS.gentleOlive,
                    },
                  ]}
                >
                  <Text style={[styles.dossierAvatarText, { color: theme.textPrimary }]}>
                    {selectedPlayer.avatar}
                  </Text>
                </View>

                <View style={styles.dossierIdentity}>
                  <Text style={[styles.dossierName, { color: theme.textPrimary }]}>
                    {selectedPlayer.name}
                  </Text>
                  <Text style={[styles.dossierSubtitle, { color: theme.textSecondary }]}>
                    Division Elite • Grandmaster League
                  </Text>
                </View>

                <View
                  style={[
                    styles.dossierRatingBadge,
                    { backgroundColor: theme.accentHazelTint },
                  ]}
                >
                  <RankIcon size={14} color={COLORS.winterHazel} style={{ marginRight: 4 }} />
                  <Text style={styles.dossierRatingValue}>
                    {selectedPlayer.rating.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.dossierStatsGrid}>
                <View style={[styles.dossierStatBox, { backgroundColor: theme.bgRecessed }]}>
                  <Text style={[styles.dossierStatVal, { color: COLORS.gentleOlive }]}>
                    {selectedPlayer.winRate}%
                  </Text>
                  <Text style={[styles.dossierStatLabel, { color: theme.textMuted }]}>WIN RATE</Text>
                </View>
                <View style={[styles.dossierStatBox, { backgroundColor: theme.bgRecessed }]}>
                  <Text style={[styles.dossierStatVal, { color: theme.textPrimary }]}>
                    {selectedPlayer.wins}
                  </Text>
                  <Text style={[styles.dossierStatLabel, { color: theme.textMuted }]}>VICTORIES</Text>
                </View>
                <View style={[styles.dossierStatBox, { backgroundColor: theme.bgRecessed }]}>
                  <Text style={[styles.dossierStatVal, { color: COLORS.winterHazel }]}>
                    {selectedPlayer.rank === 1 ? '12 WINS' : '6 WINS'}
                  </Text>
                  <Text style={[styles.dossierStatLabel, { color: theme.textMuted }]}>BEST STREAK</Text>
                </View>
              </View>
            </View>
          );
        })()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  trophyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 202, 154, 0.4)',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.dock,
    padding: SPACING.xs,
    borderWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryOrange,
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E94A0',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.2,
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  podiumContainer: {
    borderRadius: RADIUS.hero,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  podiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  podiumHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  livePip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gentleOlive,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.lunarShadow,
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  podiumStage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  podiumColWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCenterWrapper: {
    marginBottom: 4,
  },
  avatarHolder: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarGoldRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.winterHazel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSilverRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBronzeRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  avatarInitialsGold: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  goldBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: COLORS.winterHazel,
    paddingHorizontal: 9,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  goldBadgeNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  silverBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#94A3B8',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  bronzeBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#B45309',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  badgeNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  podiumPlayerName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  goldPlayerName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.winterHazel,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginBottom: 8,
  },
  ratingPillGold: {
    borderWidth: 1,
  },
  ratingPillScore: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  pedestalStep: {
    width: '100%',
    borderTopLeftRadius: RADIUS.control,
    borderTopRightRadius: RADIUS.control,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pedestalGold: {
    height: 100,
  },
  pedestalSilver: {
    height: 75,
  },
  pedestalBronze: {
    height: 60,
  },
  pedestalShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  pedestalRoman: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: 2,
    color: '#64748B',
  },
  pedestalWinRate: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  listContainer: {
    gap: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tierHeaderSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  listItem: {
    borderRadius: RADIUS.surface,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  rankBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.compact,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  listRankText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  listAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  listAvatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  listMeta: {
    flex: 1,
    gap: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  currentUserName: {
    fontWeight: '800',
  },
  youTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  youTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  listTier: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  listScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  listRating: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  dossierCard: {
    borderRadius: RADIUS.hero,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    marginTop: SPACING.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dossierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  dossierRankTag: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dossierLiveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dossierProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dossierAvatarSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: SPACING.sm,
  },
  dossierAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dossierIdentity: {
    flex: 1,
  },
  dossierName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dossierSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dossierRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  dossierRatingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A6724',
    fontFamily: TYPOGRAPHY.monoFamily,
  },
  dossierStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dossierStatBox: {
    flex: 1,
    borderRadius: RADIUS.compact,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  dossierStatVal: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: 2,
  },
  dossierStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
