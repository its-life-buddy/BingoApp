import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { Player, PublicRoom } from '../../domain/types';
import { RoomPageState } from '../../domain/state/useMultiplayerRoom';
import { CreateRoomCard } from './CreateRoomCard';
import { JoinRoomCard } from './JoinRoomCard';
import { PlayerSlot } from './PlayerSlot';
import { RoomStatus } from './RoomStatus';
import { CopyRoomCodeButton } from './CopyRoomCodeButton';
import { ChevronIcon } from '../icons/CustomIcons';

export interface RoomPageProps {
  player: Player;
  room: PublicRoom | null;
  players: Player[];
  pageState: RoomPageState;
  isHost: boolean;
  canStart: boolean;
  countdownSeconds: number | null;
  errorMessage?: string;
  onCreateRoom: (name?: string) => void;
  onJoinRoom: (code: string) => void;
  onStartMatch: () => void;
  onExitRoom: () => void;
  onBackToRooms: () => void;
  onBackToLobby: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({
  player,
  room,
  players = [],
  pageState = 'IDLE',
  isHost = false,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  canStart = false,
  countdownSeconds = null,
  errorMessage,
  onCreateRoom,
  onJoinRoom,
  onStartMatch,
  onExitRoom,
  onBackToRooms,
  onBackToLobby,
}) => {
  const { theme } = useTheme();
  const [joinCode, setJoinCode] = useState('');

  const opponentPlayer = players.find((p) => p.id !== player.id);
  const hostPlayer = players.find((p) => p.id === room?.hostId) || (isHost ? player : null);

  const isCreating = pageState === 'CREATING';
  const isJoining = pageState === 'JOINING';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isWaiting = pageState === 'WAITING';
  const isReady = pageState === 'ROOM_READY';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isStarting = pageState === 'STARTING';
  const isClosed = pageState === 'CLOSED';
  const isExpired = pageState === 'EXPIRED';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isError = pageState === 'ERROR' && !room;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bgCanvas }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOP NAVIGATION HEADER */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={room ? onExitRoom : onBackToLobby}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={room ? 'Exit Room' : 'Back to Home'}
        >
          <ChevronIcon direction="left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
          BINGO ROOMS
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* 2. LIVE STATUS BADGE */}
      <RoomStatus
        state={pageState}
        playerCount={players.length}
        maxPlayers={2}
      />

      {/* 3. CLOSED OR EXPIRED STATE VIEW */}
      {(isClosed || isExpired) && (
        <View
          style={[
            styles.stateBannerCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: COLORS.dangerRed,
            },
          ]}
        >
          <View style={[styles.alertDot, { backgroundColor: COLORS.dangerRed }]} />
          <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>
            {isClosed ? 'ROOM CLOSED' : 'ROOM EXPIRED'}
          </Text>
          <Text style={[styles.stateDesc, { color: theme.textSecondary }]}>
            {errorMessage || (isClosed ? 'This room is no longer available.' : 'The room waiting period has timed out.')}
          </Text>

          <TouchableOpacity
            testID="back-to-rooms-button"
            style={[
              styles.primaryActionBtn,
              {
                backgroundColor: COLORS.gentleOlive,
                borderColor: '#B8C665',
              },
            ]}
            onPress={onBackToRooms}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Back to Rooms"
          >
            <Text style={[styles.primaryActionBtnText, { color: COLORS.lunarShadow }]}>
              Back to Rooms
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. ACTIVE ROOM VIEW (WAITING / READY / STARTING) */}
      {room && !isClosed && !isExpired && (
        <View
          style={[
            styles.roomActiveCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: isReady ? '#10B981' : theme.borderSubtle,
            },
          ]}
        >
          {/* ROOM CODE DISPLAY BANNER */}
          <View style={styles.roomCodeHero}>
            <Text style={[styles.roomCodeSub, { color: theme.textSecondary }]}>
              BINGO ROOM CODE
            </Text>
            <Text style={[styles.roomCodeValue, { color: theme.textPrimary }]}>
              {room.id}
            </Text>

            <View style={styles.copyRow}>
              <CopyRoomCodeButton code={room.id} />
              <TouchableOpacity
                testID="exit-room-button"
                style={[
                  styles.exitButton,
                  {
                    backgroundColor: theme.bgRecessed,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                onPress={onExitRoom}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Exit Room"
              >
                <Text style={[styles.exitButtonText, { color: COLORS.dangerRed }]}>
                  Exit Room
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PLAYERS SECTION (EXACTLY 2 PLAYERS) */}
          <View style={styles.playersSection}>
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              PLAYERS ({players.length} / 2)
            </Text>

            {/* Host Slot */}
            <PlayerSlot
              player={hostPlayer}
              isHost={true}
              isCurrentUser={isHost}
            />

            {/* Opponent Slot */}
            {opponentPlayer ? (
              <PlayerSlot
                player={opponentPlayer}
                isHost={false}
                isCurrentUser={!isHost}
              />
            ) : (
              <PlayerSlot isAwaiting />
            )}
          </View>

          {/* START / COUNTDOWN CONTROLS */}
          {countdownSeconds !== null ? (
            <View
              style={[
                styles.countdownBanner,
                {
                  backgroundColor: COLORS.gentleOlive,
                  borderColor: '#B8C665',
                },
              ]}
            >
              <Text style={[styles.countdownText, { color: COLORS.lunarShadow }]}>
                Match starting in {countdownSeconds}...
              </Text>
            </View>
          ) : isReady ? (
            isHost ? (
              <TouchableOpacity
                testID="start-room-match-button"
                style={[
                  styles.primaryActionBtn,
                  {
                    backgroundColor: COLORS.gentleOlive,
                    borderColor: '#B8C665',
                  },
                ]}
                onPress={onStartMatch}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Start Match"
              >
                <Text style={[styles.primaryActionBtnText, { color: COLORS.lunarShadow }]}>
                  Start Match ↗
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.waitingHostBanner,
                  {
                    backgroundColor: theme.bgRecessed,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.waitingHostText, { color: theme.textSecondary }]}>
                  Waiting for host to start match...
                </Text>
              </View>
            )
          ) : (
            <View style={styles.waitingOpponentNotice}>
              <Text style={[styles.waitingNoticeText, { color: theme.textSecondary }]}>
                Share the 6-character room code with your friend to begin!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 5. IDLE / CREATING / JOINING CARDS (DISPLAYED ON ONE SINGLE PAGE) */}
      {!room && !isClosed && !isExpired && (
        <View style={styles.cardsStack}>
          {/* CREATE ROOM CARD */}
          <CreateRoomCard
            onCreate={() => onCreateRoom('Friendly Arena')}
            loading={isCreating}
            disabled={isJoining}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
          </View>

          {/* JOIN ROOM CARD */}
          <JoinRoomCard
            value={joinCode}
            onChange={setJoinCode}
            onJoin={() => onJoinRoom(joinCode)}
            loading={isJoining}
            disabled={isCreating}
            error={errorMessage}
          />
        </View>
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
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 70,
  },
  stateBannerCard: {
    borderRadius: RADIUS.control + 4,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  alertDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.5,
  },
  stateDesc: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  roomActiveCard: {
    borderRadius: RADIUS.control + 4,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    gap: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roomCodeHero: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
  },
  roomCodeSub: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 1,
  },
  roomCodeValue: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 6,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  exitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  exitButtonText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  playersSection: {
    gap: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  primaryActionBtn: {
    height: 48,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.5,
  },
  countdownBanner: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.5,
  },
  waitingHostBanner: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    borderWidth: 1,
  },
  waitingHostText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  waitingOpponentNotice: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  waitingNoticeText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  cardsStack: {
    gap: SPACING.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.8,
  },
});
