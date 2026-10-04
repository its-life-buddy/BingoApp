/**
 * React Hook: useMultiplayerRoom
 * Connects React UI components to the AuthoritativeRoomServer and RoomTransport.
 * Provides synchronized room state, player list, drawn numbers, board interactions,
 * win claims, and rematch flows with zero conflicting states.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PublicRoom, Player, Board5x5, GridCell5x5, RoomPrivacy } from '../types';
import { RoomTransport, TransportMessage } from '../multiplayer/transport';
import { AuthoritativeRoomServer, AuthoritativeRoomSnapshot } from '../multiplayer/authoritativeRoomServer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateRoomId, hashPassword, sanitizeRoomCode, getHumanErrorMessage, validateRoomCodeFormat } from '../multiplayer/roomManager';
import { AntiCheatValidator } from '../multiplayer/antiCheatValidator';
import { evaluate5x5Wins, generate5x5Board } from '../engine/gridGameEngine';
import { SoundEngine } from '../../audio/soundEngine';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GameStateMachine, GameState } from './gameStateMachine';
import { leaderboardService } from '../services/leaderboardService';

export type RoomPageState =
  | 'IDLE'
  | 'CREATING'
  | 'WAITING'
  | 'JOINING'
  | 'ROOM_READY'
  | 'STARTING'
  | 'ERROR'
  | 'CLOSED'
  | 'EXPIRED';

const ACTIVE_ROOM_STORAGE_KEY = 'bingo_active_room_session';

export interface UseMultiplayerRoomProps {
  player: Player;
  onNavigateToScreen: (screen: 'LOBBY' | 'GAMEPLAY' | 'RESULTS' | 'TAB_NAV' | 'ROOMS') => void;
  onMatchEnd?: (isWin: boolean, mode: string, score: number, linesCompletedCount: number, ratingDelta: number) => void;
}

export function useMultiplayerRoom({ player, onNavigateToScreen, onMatchEnd }: UseMultiplayerRoomProps) {
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<Board5x5 | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [linesCompletedCount, setLinesCompletedCount] = useState(0);
  const [completedPatternIds, setCompletedPatternIds] = useState<string[]>([]);
  const [lastCompletedPatternName, setLastCompletedPatternName] = useState<string | undefined>();
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [joinError, setJoinError] = useState<string | undefined>();
  const [matchDuration, setMatchDuration] = useState(0);
  const [opponentLines, setOpponentLines] = useState<number>(0);
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | undefined>();
  const [turnExpiresAt, setTurnExpiresAt] = useState<number | undefined>();

  // Single-page room state machine
  const [roomPageState, setRoomPageState] = useState<RoomPageState>('IDLE');

  const transportRef = useRef<RoomTransport | null>(null);
  const serverRef = useRef<AuthoritativeRoomServer | null>(null);
  const stateMachineRef = useRef<GameStateMachine>(new GameStateMachine('IDLE'));
  const matchStartTimeRef = useRef<number>(0);

  // Refs for latest state to avoid stale closures in handleTransportMessage
  const latestStateRef = useRef({
    room,
    score,
    linesCompletedCount,
    onMatchEnd,
    player
  });

  useEffect(() => {
    latestStateRef.current = { room, score, linesCompletedCount, onMatchEnd, player };
  }, [room, score, linesCompletedCount, onMatchEnd, player]);

  // Concurrency and race protection flags
  const isCreatingRef = useRef<boolean>(false);
  const isJoiningRef = useRef<boolean>(false);
  const joinPromiseRef = useRef<{ resolve: () => void; reject: (err: string) => void } | null>(null);

  const isHost = room?.hostId === player.id;
  const canStart = Boolean(
    isHost &&
    room &&
    players.length === 2 &&
    players.every((p) => p.isHost || p.isReady) &&
    (room.status === 'WAITING' || room.status === 'READY')
  );

  // Clean up transport and server on unmount
  useEffect(() => {
    return () => {
      if (serverRef.current) {
        serverRef.current.destroy();
        serverRef.current = null;
      }
      if (transportRef.current) {
        transportRef.current.close();
        transportRef.current = null;
      }
    };
  }, []);

  // Handle incoming transport messages
  const handleTransportMessage = useCallback(
    (msg: TransportMessage) => {
      switch (msg.type) {
        case 'ROOM_ANNOUNCE': {
          const snapshot: AuthoritativeRoomSnapshot = msg.payload;
          setRoom(snapshot.room);
          setPlayers(snapshot.players);

          // Update room page state based on actual players count
          if (snapshot.players.length >= 2) {
            setRoomPageState('ROOM_READY');
          } else if (snapshot.players.length === 1) {
            setRoomPageState('WAITING');
          }

          // Find opponent info
          const opp = snapshot.players.find((p) => p.id !== player.id);
          if (opp) {
            setOpponentName(opp.name);
            setOpponentLines(opp.linesCompleted || 0);
          }
          break;
        }

        case 'JOIN_RESPONSE': {
          isJoiningRef.current = false;
          const { success, targetPlayerId, snapshot, board: serverBoard, error } = msg.payload;
          if (targetPlayerId === player.id) {
            if (success && snapshot) {
              setRoom(snapshot.room);
              setPlayers(snapshot.players);
              if (serverBoard) {
                setBoard(serverBoard);
              }
              setJoinError(undefined);
              if (snapshot.players.length >= 2) {
                setRoomPageState('ROOM_READY');
              } else {
                setRoomPageState('WAITING');
              }
              // Save active session for refresh restoration
              AsyncStorage.setItem(
                ACTIVE_ROOM_STORAGE_KEY,
                JSON.stringify({
                  roomId: snapshot.room.id,
                  isHost: false,
                  hostId: snapshot.room.hostId,
                  joinedAt: Date.now(),
                })
              );
              stateMachineRef.current.transition({ type: 'JOIN_SUCCESS', roomId: snapshot.room.id });
              joinPromiseRef.current?.resolve();
              joinPromiseRef.current = null;
              onNavigateToScreen('LOBBY');
            } else {
              const friendlyError = error || 'Unable to join the room. Please try again.';
              setJoinError(friendlyError);
              if (friendlyError.includes('closed')) {
                setRoomPageState('CLOSED');
              } else if (friendlyError.includes('expired')) {
                setRoomPageState('EXPIRED');
              } else {
                setRoomPageState('ERROR');
              }
              SoundEngine.playError();
              joinPromiseRef.current?.reject(friendlyError);
              joinPromiseRef.current = null;
            }
          }
          break;
        }

        case 'START_COUNTDOWN': {
          const { seconds, snapshot } = msg.payload;
          setCountdownSeconds(seconds);
          setRoomPageState('STARTING');
          if (snapshot) {
            setRoom(snapshot.room);
          }
          stateMachineRef.current.transition({ type: 'START_COUNTDOWN', seconds });

          // Local countdown ticker
          let remaining = seconds;
          const timer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              clearInterval(timer);
              setCountdownSeconds(null);
            } else {
              setCountdownSeconds(remaining);
            }
          }, 1000);
          break;
        }

        case 'MATCH_STARTED': {
          setIsGameActive(true);
          setDrawnNumbers([]);
          setScore(0);
          setLinesCompletedCount(0);
          setCompletedPatternIds([]);
          setWinner(null);
          matchStartTimeRef.current = Date.now();
          stateMachineRef.current.transition({ type: 'MATCH_STARTED' });

          if (msg.payload.snapshot) {
            setRoom(msg.payload.snapshot.room);
            // In direct matches, guest doesn't get a JOIN_RESPONSE with a board. 
            // Generate it here deterministically using the authoritative seed.
            if (msg.senderId !== player.id) {
              const guestBoard = generate5x5Board(`b-${player.id}`, `${msg.payload.snapshot.seed}-${player.id}`, false);
              setBoard(guestBoard);
            }
            setCurrentTurnPlayerId(msg.payload.snapshot.currentTurnPlayerId);
            setTurnExpiresAt(msg.payload.snapshot.turnExpiresAt);
          }

          onNavigateToScreen('GAMEPLAY');
          break;
        }

        case 'NUMBER_DRAWN': {
          const { number, drawnNumbers: calls, nextTurnPlayerId, turnExpiresAt: newExpiresAt } = msg.payload;
          setDrawnNumbers(calls);
          setCurrentTurnPlayerId(nextTurnPlayerId);
          setTurnExpiresAt(newExpiresAt);
          SoundEngine.playBallDrawn();
          SoundEngine.speakNumber(number);
          break;
        }

        case 'OPPONENT_PROGRESS': {
          if (msg.senderId !== player.id) {
            setOpponentLines(msg.payload.linesCompleted || 0);
          }
          break;
        }

        case 'CLAIM_VERIFICATION_RESULT': {
          if (msg.payload.targetPlayerId === player.id) {
            SoundEngine.playError();
            setClaimFeedback({
              success: false,
              message: msg.payload.reason || 'Claim could not be verified.',
            });
            setTimeout(() => setClaimFeedback(null), 3000);
          }
          break;
        }

        case 'WINNER_DECLARED': {
          const { winnerId, winnerName, matchDurationSec, snapshot } = msg.payload;
          setIsGameActive(false);
          setWinner({ id: winnerId, name: winnerName });
          setMatchDuration(matchDurationSec || Math.floor((Date.now() - matchStartTimeRef.current) / 1000));
          if (snapshot) setRoom(snapshot.room);

          if (winnerId === player.id) {
            SoundEngine.playWinFanfare();
          } else {
            SoundEngine.playError();
          }

          // Record match in Supabase Match History
          const { room: latestRoom, score: latestScore, linesCompletedCount: latestLines, onMatchEnd: latestOnMatchEnd } = latestStateRef.current;
          const gameMode = latestRoom?.privacy === 'open' ? 'RANKED' : 'FRIEND';
          leaderboardService.recordMatchResult(
            player.id, 
            winnerId === player.id, 
            gameMode, 
            latestScore, 
            latestLines, 
            winnerId === player.id ? 25 : -15
          );

          if (latestOnMatchEnd) {
            latestOnMatchEnd(winnerId === player.id, gameMode, latestScore, latestLines, winnerId === player.id ? 25 : -15);
          }

          stateMachineRef.current.transition({ type: 'CLAIM_VERIFIED', winnerId, winnerName });
          onNavigateToScreen('RESULTS');
          break;
        }

        case 'ROOM_CLOSED': {
          const reason = msg.payload?.reason || 'Player disconnected. The match was closed.';
          SoundEngine.playError();
          if (serverRef.current) {
            serverRef.current.destroy();
            serverRef.current = null;
          }
          if (transportRef.current) {
            transportRef.current.close();
            transportRef.current = null;
          }
          setRoom(null);
          setPlayers([]);
          setBoard(null);
          setIsGameActive(false);
          setCountdownSeconds(null);
          stateMachineRef.current.reset('IDLE');
          setJoinError(reason);
          setRoomPageState('CLOSED');
          AsyncStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
          onNavigateToScreen('ROOMS');
          break;
        }

        case 'REMATCH_CONFIRMED': {
          const snapshot: AuthoritativeRoomSnapshot = msg.payload.snapshot;
          setRoom(snapshot.room);
          setPlayers(snapshot.players);
          setIsGameActive(false);
          setWinner(null);
          setDrawnNumbers([]);
          setLinesCompletedCount(0);
          setScore(0);
          setCompletedPatternIds([]);

          // Generate fresh board for rematch
          const newBoard = generate5x5Board(`b-${player.id}`, `${snapshot.seed}-${player.id}`, false);
          setBoard(newBoard);

          stateMachineRef.current.transition({ type: 'REMATCH_CONFIRMED' });
          setRoomPageState('ROOM_READY');
          onNavigateToScreen('LOBBY');
          break;
        }
      }
    },
    [player.id, onNavigateToScreen]
  );

  // Setup transport for a room
  const setupTransport = useCallback(
    (roomId: string) => {
      if (transportRef.current) {
        transportRef.current.close();
      }
      const transport = new RoomTransport(roomId);
      transport.subscribe(handleTransportMessage);
      transportRef.current = transport;
      return transport;
    },
    [handleTransportMessage]
  );

  // 1. Create Room (with Race & Duplicate Request Protection)
  const createRoom = useCallback(
    async (name: string = 'Friendly Arena', privacy: RoomPrivacy = 'open', password?: string) => {
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;
      setRoomPageState('CREATING');
      setJoinError(undefined);

      try {
        const { globalRoomManager } = await import('../multiplayer/roomManager');
        const newRoom = await globalRoomManager.createRoom(name, player, privacy, password);
        const roomId = newRoom.id;

        const transport = setupTransport(roomId);

        // Create Authoritative Room Server on Host
        if (serverRef.current) serverRef.current.destroy();
        const server = new AuthoritativeRoomServer(newRoom, player, transport);
        serverRef.current = server;

        // Assign host board
        const hostBoard = server.getPlayerBoard(player.id);
        setBoard(hostBoard);
        setRoom(newRoom);
        setPlayers([player]);
        setRoomPageState('WAITING');

        // Persist session for page refresh restore
        AsyncStorage.setItem(
          ACTIVE_ROOM_STORAGE_KEY,
          JSON.stringify({
            roomId,
            isHost: true,
            hostId: player.id,
            joinedAt: Date.now(),
          })
        );

        stateMachineRef.current.transition({ type: 'ROOM_CREATED', roomId });
        onNavigateToScreen('LOBBY');
      } catch (err: any) {
        console.error('CREATE ROOM ERROR:', err);
        setJoinError(`Unable to create room: ${err?.message || err}`);
        setRoomPageState('ERROR');
        SoundEngine.playError();
      } finally {
        isCreatingRef.current = false;
      }
// eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [player, setupTransport]
  );

  // 2. Join Room (with Race & Duplicate Request Protection)
  const joinRoom = useCallback(
    (rawRoomId: string, password?: string): Promise<void> => {
      return new Promise<void>(async (resolve, reject) => {
        if (isJoiningRef.current) {
          return reject('Already joining a room.');
        }

        const formatCheck = validateRoomCodeFormat(rawRoomId);
        if (!formatCheck.valid) {
          setJoinError(formatCheck.error);
          setRoomPageState('ERROR');
          SoundEngine.playError();
          return reject(formatCheck.error || 'Invalid code');
        }

        const cleanId = sanitizeRoomCode(rawRoomId);

        // Same-user protection on client side
        if (room && room.hostId === player.id && room.id === cleanId) {
          setJoinError('You already own this room.');
          setRoomPageState('ERROR');
          SoundEngine.playError();
          return reject('You already own this room.');
        }

        isJoiningRef.current = true;
        setJoinError(undefined);
        setRoomPageState('JOINING');
        
        joinPromiseRef.current = { resolve, reject };

        try {
          const { globalRoomManager } = await import('../multiplayer/roomManager');
          const joinResult = await globalRoomManager.joinRoom(cleanId, player, password);

          if (!joinResult.success) {
            isJoiningRef.current = false;
            setJoinError(joinResult.error || 'Unable to join the room.');
            setRoomPageState('ERROR');
            SoundEngine.playError();
            joinPromiseRef.current = null;
            return reject(joinResult.error || 'Unable to join');
          }

          const transport = setupTransport(cleanId);

          // Send Join Request to authoritative room host
          transport.send('JOIN_REQUEST', cleanId, player.id, {
            player,
            password,
          });

          // Speculative board while waiting for server response
          const speculativeBoard = generate5x5Board(`b-${player.id}`, `join-${cleanId}-${Date.now()}`, false);
          setBoard(speculativeBoard);

          // Timeout fallback if host never responds within 15s
          setTimeout(() => {
            if (isJoiningRef.current) {
              isJoiningRef.current = false;
              setJoinError('Room not found or host unavailable.');
              setRoomPageState('ERROR');
              SoundEngine.playError();
              joinPromiseRef.current?.reject('Room not found or host unavailable.');
              joinPromiseRef.current = null;
            }
          }, 15000);
        } catch (err: any) {
          console.error('JOIN ROOM ERROR:', err);
          isJoiningRef.current = false;
          setJoinError(`Unable to join: ${err?.message || err}`);
          setRoomPageState('ERROR');
          SoundEngine.playError();
          joinPromiseRef.current?.reject(err?.message || 'Error joining room');
          joinPromiseRef.current = null;
        }
      });
    },
    [player, setupTransport, room]
  );

  // 3. Toggle Ready
  const toggleReady = useCallback(
    (isReady: boolean) => {
      if (!room || !transportRef.current) return;
      transportRef.current.send('PLAYER_READY_TOGGLE', room.id, player.id, {
        playerId: player.id,
        isReady,
      });
      // Optimistic update
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, isReady } : p))
      );
    },
    [room, player.id]
  );

  // 4. Start Match (Host only)
  const startMatch = useCallback(() => {
    if (!room || !isHost || !transportRef.current) return;
    if (players.length < 2) return;
    setRoomPageState('STARTING');
    transportRef.current.send('START_COUNTDOWN', room.id, player.id, {
      seconds: 3,
    });
  }, [room, isHost, player.id, players.length]);

  // 5. Daub Cell
  const daubCell = useCallback(
    (cell: GridCell5x5) => {
      if (!board || !isGameActive) return;
      if (cell.state === 'MARKED' || cell.state === 'COMPLETED') return;

      // Authoritative anti-cheat validation: if it hasn't been called, call it!
      const isLegitCalled = AntiCheatValidator.validateDaub(cell.value, drawnNumbers);
      if (!isLegitCalled) {
        // Enforce turn based calling
        if (currentTurnPlayerId && currentTurnPlayerId !== player.id) {
          SoundEngine.playError();
          setClaimFeedback({
            success: false,
            message: "It's not your turn!",
          });
          setTimeout(() => setClaimFeedback(null), 1400);
          return;
        }

        // Send a request to call this number to the server.
        if (transportRef.current && room) {
          transportRef.current.send('CALL_NUMBER_REQUEST', room.id, player.id, { number: cell.value });
          // Optimistically lock the turn to prevent rapid-fire cheating
          setCurrentTurnPlayerId('server-processing');
        }
        // Do not return; let it fall through to optimistically mark the cell.
      }

      // Mark cell
      const newMatrix = board.matrix.map((row) =>
        row.map((c) => {
          if (c.id === cell.id) {
            return {
              ...c,
              state: 'MARKED' as const,
              daubTimestamp: Date.now(),
            };
          }
          return c;
        })
      );

      const updatedBoard: Board5x5 = {
        ...board,
        matrix: newMatrix,
      };

      SoundEngine.playDaub();

      // Check winning lines
      const winResult = evaluate5x5Wins(updatedBoard, completedPatternIds);
      if (winResult.newlyCompletedPatterns.length > 0) {
        SoundEngine.playLineCompleted();
        const newPatternIds = winResult.newlyCompletedPatterns.map((p) => p.id);
        const lastPattern = winResult.newlyCompletedPatterns[winResult.newlyCompletedPatterns.length - 1];

        const updatedLineCount = linesCompletedCount + winResult.newlyCompletedPatterns.length;
        const updatedScore = score + winResult.newlyCompletedPatterns.length * 500;

        setCompletedPatternIds((prev) => [...prev, ...newPatternIds]);
        setLinesCompletedCount(updatedLineCount);
        setLastCompletedPatternName(lastPattern.name);
        setScore(updatedScore);

        // Highlight winning cells
        winResult.winningCoords.forEach(({ row, col }) => {
          updatedBoard.matrix[row][col].isWinningCell = true;
          updatedBoard.matrix[row][col].state = 'COMPLETED';
        });

        // Broadcast progress to opponent
        if (room && transportRef.current) {
          transportRef.current.send('OPPONENT_PROGRESS', room.id, player.id, {
            linesCompleted: updatedLineCount,
            score: updatedScore,
          });
        }

        setTimeout(() => setLastCompletedPatternName(undefined), 2500);
      }

      setBoard(updatedBoard);
// eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [board, isGameActive, drawnNumbers, completedPatternIds, linesCompletedCount, score, room, player.id]
  );

  // 6. Claim Bingo
  const claimBingo = useCallback(() => {
    if (!board || !isGameActive || !room || !transportRef.current) return;

    if (linesCompletedCount < 5) {
      SoundEngine.playError();
      setClaimFeedback({
        success: false,
        message: 'You need 5 completed lines to claim BINGO!',
      });
      setTimeout(() => setClaimFeedback(null), 2000);
      return;
    }

    // Send claim request to authoritative server
    transportRef.current.send('CLAIM_BINGO_REQUEST', room.id, player.id, {
      playerId: player.id,
      boardId: board.id,
      claimTimestamp: Date.now(),
// eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [board, isGameActive, room, player.id, linesCompletedCount, completedPatternIds]);

  // 7. Request Rematch
  const requestRematch = useCallback(() => {
    if (!room || !transportRef.current) return;
    transportRef.current.send('REMATCH_REQUEST', room.id, player.id, {});
  }, [room, player.id]);

  // 8. Leave Room / Disconnect / Exit Room
  const leaveRoom = useCallback(() => {
    if (room && transportRef.current) {
      try {
        transportRef.current.send('ROOM_CLOSED', room.id, player.id, {
          reason: `${player.name || 'Opponent'} disconnected. Match closed.`,
          disconnectedPlayerId: player.id,
        });
      } catch {
        // Safe ignore
      }
    }

    if (serverRef.current) {
      serverRef.current.destroy();
      serverRef.current = null;
    }
    if (transportRef.current) {
      transportRef.current.close();
      transportRef.current = null;
    }
    setRoom(null);
    setPlayers([]);
    setBoard(null);
    setIsGameActive(false);
    setCountdownSeconds(null);
    setRoomPageState('IDLE');
    setJoinError(undefined);
    stateMachineRef.current.reset('IDLE');
    AsyncStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
    onNavigateToScreen('TAB_NAV');
  }, [room, player.id, player.name, onNavigateToScreen]);

  // Reset page state back to IDLE (e.g. from error or closed state)
  const resetToIdle = useCallback(() => {
    setJoinError(undefined);
    setRoomPageState('IDLE');
  }, []);

  // 9. Join Direct Matched Session (for Random Player 2-player matchmaking)
  const joinDirectMatchSession = useCallback(
    (gameSessionId: string, opponent: Player, isMatchHost: boolean) => {
      const matchRoom: PublicRoom = {
        id: gameSessionId,
        name: 'Live 1v1 Arena',
        privacy: 'open',
        hostId: isMatchHost ? player.id : opponent.id,
        hostName: isMatchHost ? player.name : opponent.name,
        playerCount: 2,
        maxPlayers: 2,
        status: 'ACTIVE',
        createdAt: Date.now(),
        ticketPrice: 0,
        jackpotAmount: 1000,
        recommendedTickets: [1],
      };

      const transport = setupTransport(gameSessionId);

      if (isMatchHost) {
        if (serverRef.current) serverRef.current.destroy();
        const server = new AuthoritativeRoomServer(matchRoom, player, transport);
        serverRef.current = server;
        const hostBoard = server.getPlayerBoard(player.id);
        setBoard(hostBoard);
        // Start authoritative game loop immediately
        server.startDirectMatch(opponent);
      }

      setRoom(matchRoom);
      setPlayers([
        { ...player, isHost: isMatchHost, isReady: true },
        { ...opponent, isHost: !isMatchHost, isReady: true },
      ]);
      setOpponentName(opponent.name);
      setOpponentLines(0);
      
      // Do NOT navigate to GAMEPLAY synchronously here.
      // Wait for the server's MATCH_STARTED broadcast to set the board and transition the screen.
// eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [player, setupTransport, onNavigateToScreen]
  );

  const hasRestoredRef = useRef(false);

  // 10. Restore Session on Refresh
  useEffect(() => {
    const restoreActiveSession = async () => {
      if (hasRestoredRef.current) return;
      hasRestoredRef.current = true;
      try {
        const stored = await AsyncStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!parsed?.roomId || !parsed?.joinedAt) return;

        // Verify session not older than 15 minutes
        if (Date.now() - parsed.joinedAt > 300000) {
          await AsyncStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
          return;
        }

        // Reconnect transport
        const transport = setupTransport(parsed.roomId);
        if (parsed.isHost) {
          // Host reconnect
          setRoomPageState('WAITING');
        } else {
          // Guest reconnect -> query state
          transport.send('SYNC_STATE_REQUEST', parsed.roomId, player.id, {});
          setRoomPageState('JOINING');
        }
      } catch {
        // Safe ignore
      }
    };

    restoreActiveSession();
  }, [player.id, setupTransport]);

  return {
    room,
    players,
    board,
    drawnNumbers,
    score,
    linesCompletedCount,
    lastCompletedPatternName,
    isGameActive,
    isPaused,
    countdownSeconds,
    winner,
    claimFeedback,
    joinError,
    matchDuration,
    opponentLines,
    opponentName,
    currentTurnPlayerId,
    turnExpiresAt,
    isHost,
    canStart,
    roomPageState,
    createRoom,
    joinRoom,
    joinDirectMatchSession,
    toggleReady,
    startMatch,
    daubCell,
    claimBingo,
    requestRematch,
    leaveRoom,
    resetToIdle,
    togglePause: () => setIsPaused((prev) => !prev),
  };
}
