import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
import { Player, RobotDifficulty } from '../domain/types';
import { globalRoomManager } from '../domain/multiplayer/roomManager';
import { SoundEngine } from '../audio/soundEngine';
import { PlayerHeader } from '../components/bingo/PlayerHeader';
import { GameModeCard } from '../components/bingo/GameModeCard';
import {
  CloseIcon,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  UsersIcon,
} from '../components/icons/CustomIcons';
import { NumberSourceModal } from '../components/bingo/NumberSourceModal';
import { useTheme } from '../design/theme';

interface HomeScreenProps {
  player: Player;
  onPlayRanked?: () => void;
  onPlayRandomPlayer?: () => void;
  onPlayRandomHuman?: () => void;
  onPlayRobot: (difficulty: RobotDifficulty) => void;
  onPlayFriend?: () => void;
  onDailyPuzzle: () => void;
  onLocalPlay?: () => void;
  onJoinRoom?: (roomId: string) => void;
  onCreateRoomDirect?: () => void;
  onOpenSettings?: () => void;
  onOpenRoomSelection?: () => void;
  onOpenDailyBonusModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  player,
  onPlayRanked,
  onPlayRandomPlayer,
  onPlayRandomHuman,
  onPlayRobot,
  onPlayFriend,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDailyPuzzle,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocalPlay,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onJoinRoom,
  onCreateRoomDirect,
  onOpenSettings,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenRoomSelection,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenDailyBonusModal,
}) => {
  const { theme } = useTheme();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [numberSourceModalVisible, setNumberSourceModalVisible] = useState(false);
  const [pendingModeAction, setPendingModeAction] = useState<{
    mode: 'ONLINE' | 'FRIENDS' | 'AI';
    title: string;
    action: (numbers?: number[], source?: 'manual' | 'ai') => void;
  } | null>(null);

  const openNumberSourceModal = (
    mode: 'ONLINE' | 'FRIENDS' | 'AI',
    title: string,
    action: (numbers?: number[], source?: 'manual' | 'ai') => void
  ) => {
    setPendingModeAction({ mode, title, action });
    setNumberSourceModalVisible(true);
  };

  const handleRandomPlayerAction = () => {
    if (onPlayRandomHuman) {
      onPlayRandomHuman();
      return;
    }
    openNumberSourceModal('ONLINE', 'Play Online 1v1', () => {
      if (onPlayRandomPlayer) {
        onPlayRandomPlayer();
      } else if (onPlayRanked) {
        onPlayRanked();
      }
    });
  };

  const [soundEnabled, setSoundEnabled] = useState(!SoundEngine.isAudioMuted());
  const [voiceEnabled, setVoiceEnabled] = useState(SoundEngine.isVoiceEnabled());
  const [showRobotModal, setShowRobotModal] = useState(false);

  const loadLobbyData = async () => {
    const count = await globalRoomManager.getLiveOnlinePlayerCount();
    setOnlineCount(count);
  };

  useEffect(() => {
    loadLobbyData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLobbyData();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    SoundEngine.setMuted(!next);
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    SoundEngine.setVoiceEnabled(next);
  };

  const handlePlayFriendsAction = () => {
    openNumberSourceModal('FRIENDS', 'Play with Friends', () => {
      if (onPlayFriend) onPlayFriend();
      else if (onCreateRoomDirect) onCreateRoomDirect();
    });
  };

  const handlePlayAIAction = () => {
    openNumberSourceModal('AI', 'Play with AI', () => {
      setShowRobotModal(true);
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bgCanvas }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.gentleOlive}
        />
      }
    >
      {/* 1. THREEUI REBUILT PLAYER HEADER (Floating Control Surface with unified IconButton and Presence Pip) */}
      <PlayerHeader
        playerName={player.name}
        tier={player.tier}
        rating={player.rating}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenSettings={onOpenSettings}
      />

      {/* HERO SECTION: WELCOME & LOGO */}
      <View style={styles.heroSection}>
        <Image
          source={require('../assets/app_icon.png')}
          style={styles.heroAppIcon}
          resizeMode="contain"
          accessibilityLabel="Bingo Adventure Compass Emblem"
        />
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>BINGO</Text>
        </View>
        <Text style={[styles.heroHeadline, { color: theme.textPrimary }]}>
          Choose How to Play
        </Text>
        <Text style={[styles.heroSubheadline, { color: theme.textSecondary }]}>
          Instant multiplayer or offline challenge
        </Text>
      </View>

      {/* CORE 3 GAME MODES */}
      <View style={styles.modesContainer}>
        {/* 1. PLAY ONLINE */}
        <GameModeCard
          id="ONLINE"
          title="PLAY ONLINE"
          tagline="Find a player and compete live"
          badge="LIVE 1V1"
          onPress={handleRandomPlayerAction}
          testID="home-mode-online"
          accessibilityLabel="Play Random Player, Real Human 1v1 Matchmaking"
        />

        {/* 2. PLAY WITH FRIENDS */}
        <GameModeCard
          id="FRIENDS"
          title="PLAY WITH FRIENDS"
          tagline="Create or join a private room"
          badge="ROOM CODE"
          onPress={handlePlayFriendsAction}
          testID="home-mode-friends"
        />

        {/* 3. PLAY WITH AI */}
        <GameModeCard
          id="AI"
          title="PLAY WITH AI"
          tagline="Play instantly against AI"
          badge="INSTANT"
          onPress={handlePlayAIAction}
          testID="home-mode-ai"
        />
      </View>

      <Modal visible={showRobotModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>
                Select Robot Difficulty
              </Text>
              <TouchableOpacity
                onPress={() => setShowRobotModal(false)}
                style={styles.modalCloseIcon}
                accessibilityRole="button"
                accessibilityLabel="Close difficulty selection"
              >
                <CloseIcon size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalIntro, { color: theme.textSecondary }]}>
              The AI plays on an authentic board with real decision latencies.
            </Text>

            <TouchableOpacity
              style={[
                styles.diffOption,
                {
                  backgroundColor: theme.bgRecessed,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => {
                setShowRobotModal(false);
                onPlayRobot('EASY');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.diffHeaderRow}>
                <Text style={[styles.diffName, { color: theme.textPrimary }]}>Apprentice</Text>
                <View
                  style={[
                    styles.diffTagPill,
                    { backgroundColor: theme.accentOliveTint },
                  ]}
                >
                  <Text style={[styles.diffTagText, { color: COLORS.lunarShadow }]}>
                    CASUAL
                  </Text>
                </View>
              </View>
              <Text style={[styles.diffDetail, { color: theme.textSecondary }]}>
                Relaxed tempo • 3–5s reaction time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.diffOption,
                styles.diffOptionActive,
                {
                  backgroundColor: theme.accentHazelTint,
                  borderColor: COLORS.winterHazel,
                },
              ]}
              onPress={() => {
                setShowRobotModal(false);
                onPlayRobot('MEDIUM');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.diffHeaderRow}>
                <Text style={[styles.diffName, { color: theme.textPrimary }]}>Challenger</Text>
                <View
                  style={[
                    styles.diffTagPill,
                    { backgroundColor: COLORS.winterHazel },
                  ]}
                >
                  <Text style={[styles.diffTagText, { color: COLORS.lunarShadow }]}>
                    RECOMMENDED
                  </Text>
                </View>
              </View>
              <Text style={[styles.diffDetail, { color: theme.textSecondary }]}>
                Balanced human pace • 1.5–2.5s reaction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.diffOption,
                {
                  backgroundColor: theme.bgRecessed,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => {
                setShowRobotModal(false);
                onPlayRobot('HARD');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.diffHeaderRow}>
                <Text style={[styles.diffName, { color: theme.textPrimary }]}>Grandmaster</Text>
                <View
                  style={[
                    styles.diffTagPill,
                    { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                  ]}
                >
                  <Text style={[styles.diffTagText, { color: '#DC2626' }]}>EXPERT</Text>
                </View>
              </View>
              <Text style={[styles.diffDetail, { color: theme.textSecondary }]}>
                Lightning speed • 0.4–1.0s rapid marks
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NUMBER SOURCE CONFIGURATION MODAL */}
      {pendingModeAction && (
        <NumberSourceModal
          visible={numberSourceModalVisible}
          gameModeTitle={pendingModeAction.title}
          onClose={() => {
            setNumberSourceModalVisible(false);
            setPendingModeAction(null);
          }}
          onConfirmNumbers={(numbers, source) => {
            setNumberSourceModalVisible(false);
            const action = pendingModeAction.action;
            setPendingModeAction(null);
            action(numbers, source);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: 110,
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  heroAppIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  logoBadge: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontFamily: TYPOGRAPHY.brandFamily,
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  heroHeadline: {
    fontFamily: TYPOGRAPHY.brandFamily,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubheadline: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
  modesContainer: {
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg, // 16px
  },
  modalContent: {
    borderRadius: RADIUS.hero, // 24px
    padding: SPACING.xl, // 20px
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs, // 4px
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  modalCloseIcon: {
    padding: SPACING.xs, // 4px
  },
  modalIntro: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md, // 12px
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  diffOption: {
    borderRadius: RADIUS.control, // 12px
    padding: SPACING.md, // 12px
    marginBottom: SPACING.sm, // 8px
    borderWidth: 1,
  },
  diffOptionActive: {
    borderWidth: 1.5,
  },
  diffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  diffName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  diffTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  diffTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  diffDetail: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  privateRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.control + 4,
    borderWidth: 1.5,
    marginVertical: SPACING.xs,
  },
  privateRoomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  privateRoomIconBox: {
    width: 40,
    height: 40,
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
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  openRoomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  openRoomBtnText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
