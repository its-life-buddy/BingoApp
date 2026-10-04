/**
 * Main Application Root
 * Android Bingo App - Complete Storyboard Implementation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Board5x5,
  GridCell5x5,
  Player,
  PublicRoom,
  RobotDifficulty,
  TabDestination,
  ScreenState,
  GameModeType,
  RoomPrivacy,
  StoreItem,
} from './src/domain/types';
import {
  generate5x5Board,
  generate5x5NumberPool,
  evaluate5x5Wins,
} from './src/domain/engine/gridGameEngine';
import { RobotOpponent } from './src/domain/engine/robotOpponent';
import { AntiCheatValidator } from './src/domain/multiplayer/antiCheatValidator';
import { SoundEngine } from './src/audio/soundEngine';
import { ThemeProvider, useTheme } from './src/design/theme';
import { useMultiplayerRoom } from './src/domain/state/useMultiplayerRoom';
import { supabase } from './src/lib/supabase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomNavBar } from './src/components/navigation/BottomNavBar';
import { SplashScreen } from './src/screens/SplashScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { DeleteAccountScreen } from './src/screens/DeleteAccountScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoomSelectionScreen } from './src/screens/RoomSelectionScreen';
import { PreGameScreen } from './src/screens/PreGameScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RoomPage } from './src/components/rooms/RoomPage';
import { CreateRoomScreen } from './src/screens/CreateRoomScreen';
import { JoinRoomScreen } from './src/screens/JoinRoomScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { GameplayScreen } from './src/screens/GameplayScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { DailyPuzzleScreen } from './src/screens/DailyPuzzleScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MatchmakingScreen } from './src/screens/MatchmakingScreen';
import { DailyBonusModal } from './src/components/common/DailyBonusModal';
import { globalMatchmakingService } from './src/domain/multiplayer/matchmakingService';
import { leaderboardService } from './src/domain/services/leaderboardService';
import { MatchmakingStatus } from './src/domain/types';

function MainApp() {
  const { theme, isDark } = useTheme();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabDestination>('PLAY');
  const [authStatus, setAuthStatus] = useState<'AUTH_RESTORING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'>('AUTH_RESTORING');
  const [screenState, setScreenState] = useState<ScreenState>('SPLASH');
  const [gameMode, setGameMode] = useState<GameModeType>('LOCAL');

  // Player Profile State (Real local player identity with coins & gems)
  const [player, setPlayer] = useState<Player>({
    id: `player-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: 'Player',
    avatar: 'PL',
    isHost: false,
    isReady: false,
    score: 0,
    linesCompleted: 0,
    hasWon: false,
    rating: 1450,
    tier: 'Platinum',
    coins: 50380,
    gems: 1000,
  });

  // Selected Room & Multi-card state
  const [selectedRoom, setSelectedRoom] = useState<PublicRoom | null>(null);
  const [purchasedCardsCount, setPurchasedCardsCount] = useState<number>(1);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState<boolean>(false);

  // Active Boards (Single or Multi-card)
  const [board, setBoard] = useState<Board5x5 | null>(null);
  const [additionalBoards, setAdditionalBoards] = useState<Board5x5[]>([]);
  const [numberPool, setNumberPool] = useState<number[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [linesCompletedCount, setLinesCompletedCount] = useState(0);
  const [completedPatternIds, setCompletedPatternIds] = useState<string[]>([]);
  const [lastCompletedPatternName, setLastCompletedPatternName] = useState<string | undefined>();
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [matchStartTime, setMatchStartTime] = useState<number>(Date.now());
  const [matchDuration, setMatchDuration] = useState<number>(0);

  // AI Robot Opponent State
  const robotRef = useRef<RobotOpponent | null>(null);
  const [robotLines, setRobotLines] = useState<number>(0);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | undefined>();
  const [turnExpiresAt, setTurnExpiresAt] = useState<number | undefined>();

  const callerIntervalRef = useRef<any>(null);

  // Matchmaking State (Random Player 1v1 Arena)
  const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingStatus>('IDLE');
  const [matchedOpponent, setMatchedOpponent] = useState<Player | null>(null);
  const [matchCountdown, setMatchCountdown] = useState<number | null>(null);

  // Helper to calculate new rating/tier and apply to player state
  const applyMatchOutcome = (isWin: boolean, mode: string, matchScore: number, matchLines: number, ratingDelta: number) => {
    setPlayer((prev) => {
      // Calculate MMR Delta
      const newRating = Math.max(1000, (prev.rating || 1000) + ratingDelta);
      
      // Calculate Tier
      let newTier = prev.tier || 'Bronze';
      if (newRating >= 1800) newTier = 'Grandmaster';
      else if (newRating >= 1600) newTier = 'Master';
      else if (newRating >= 1400) newTier = 'Platinum';
      else if (newRating >= 1200) newTier = 'Gold';
      else if (newRating >= 1100) newTier = 'Silver';
      else newTier = 'Bronze';
      
      // Calculate Coins
      const coinDelta = isWin ? 1500 : -500;
      const newCoins = Math.max(0, prev.coins + coinDelta);

      // Record to DB asynchronously
      leaderboardService.recordMatchResult(prev.id, isWin, mode, matchScore, matchLines, ratingDelta);

      return {
        ...prev,
        coins: newCoins,
        score: prev.score + matchScore + (isWin ? 1000 : 0),
        rating: newRating,
        tier: newTier,
      };
    });
  };

  // Authoritative Realtime Multiplayer Room Controller
  const multiplayer = useMultiplayerRoom({
    player,
    onNavigateToScreen: setScreenState,
    onMatchEnd: (isWin, mode, matchScore, matchLines, ratingDelta) => {
      applyMatchOutcome(isWin, mode, matchScore, matchLines, ratingDelta);
    }
  });

  // Supabase & Local Session State Listener
  useEffect(() => {
    const fetchProfile = async (userId: string, email: string | undefined): Promise<boolean> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (data && !error) {
        // Block login if banned (Apple requirement)
        if (data.is_banned) {
          await supabase.auth.signOut();
          await AsyncStorage.removeItem('bingo_user_session');
          if (Platform.OS === 'web') {
            // eslint-disable-next-line no-alert
            window.alert('Your account has been suspended due to multiple reports.');
          } else {
            Alert.alert('Account Suspended', 'Your account has been suspended due to multiple reports.');
          }
          setAuthStatus('UNAUTHENTICATED');
          setScreenState('SIGN_IN');
          return false;
        }

        const updated = {
          id: data.id,
          name: data.name,
          coins: data.coins,
          gems: data.gems,
          rating: data.rating,
          tier: data.tier,
        };
        setPlayer((prev) => ({ ...prev, ...updated }));
        AsyncStorage.setItem('bingo_user_session', JSON.stringify({ userId: data.id, name: data.name }));
        return true;
      } else {
        const updated = { id: userId, name: email?.split('@')[0] || 'Player' };
        setPlayer((prev) => ({ ...prev, ...updated }));
        AsyncStorage.setItem('bingo_user_session', JSON.stringify(updated));
        return true;
      }
    };

    // Check both Supabase auth session and stored local session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAllowed = await fetchProfile(session.user.id, session.user.email);
          if (isAllowed) {
            setAuthStatus('AUTHENTICATED');
            setScreenState('TAB_NAV');
          }
          return;
        }

        // Check persisted user session (for guest/QA or offline persistence)
        const stored = await AsyncStorage.getItem('bingo_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.userId) {
            setPlayer((prev) => ({ ...prev, id: parsed.userId, name: parsed.name || prev.name }));
            setAuthStatus('AUTHENTICATED');
            setScreenState('TAB_NAV');
            return;
          }
        }
      } catch {
        // Fallback gracefully
      }

      setAuthStatus('UNAUTHENTICATED');
      setScreenState('SIGN_IN');
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const isAllowed = await fetchProfile(session.user.id, session.user.email);
        if (isAllowed) {
          setAuthStatus('AUTHENTICATED');
          setScreenState('TAB_NAV');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Explicit User Logout Handler (until clicked, user stays logged in)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Safe ignore
    }
    await AsyncStorage.removeItem('bingo_user_session');
    setPlayer((prev) => ({
      ...prev,
      id: `player-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: 'Player',
    }));
    setScreenState('SIGN_IN');
  };

  // Android Back Button Lifecycle
  useEffect(() => {
    const onBackPress = () => {
      if (screenState === 'GAMEPLAY') {
        const quitMatch = () => {
          if (gameMode === 'FRIEND') {
            multiplayer.leaveRoom();
          } else {
            setIsGameActive(false);
            if (callerIntervalRef.current) clearInterval(callerIntervalRef.current);
            setScreenState('TAB_NAV');
          }
        };

        if (Platform.OS === 'web') {
          // eslint-disable-next-line no-alert
          const shouldQuit = typeof window !== 'undefined' && window.confirm 
            ? window.confirm('Are you sure you want to quit the current match?')
            : true;
          if (shouldQuit) quitMatch();
        } else {
          Alert.alert(
            'Quit Match',
            'Are you sure you want to quit the current match?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: quitMatch }
            ]
          );
        }
        return true;
      }

      if (
        screenState === 'ROOMS' ||
        screenState === 'CREATE_ROOM' ||
        screenState === 'JOIN_ROOM' ||
        screenState === 'DAILY_PUZZLE' ||
        screenState === 'SETTINGS' ||
        screenState === 'RESULTS' ||
        screenState === 'ROOM_SELECTION' ||
        screenState === 'PRE_GAME'
      ) {
        if (gameMode === 'FRIEND') {
          multiplayer.leaveRoom();
        }
        setScreenState('TAB_NAV');
        return true;
      }

      if (screenState === 'MATCHMAKING') {
        handleCancelMatchmaking();
        return true;
      }

      if (screenState === 'LOBBY') {
        if (gameMode === 'FRIEND') {
          multiplayer.leaveRoom();
        }
        setScreenState('TAB_NAV');
        return true;
      }

      if (screenState === 'TAB_NAV') {
        if (currentTab !== 'PLAY') {
          setCurrentTab('PLAY');
          return true;
        }
        return false;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [screenState, currentTab, gameMode, multiplayer]);

  // Setup game boards and pools for Local / Solo / Multi-card
  const initGame = useCallback((mode: GameModeType, cardCount: number = 1, customSeed?: string) => {
    const seed = customSeed || `game-${Date.now()}`;
    const primaryBoard = generate5x5Board(`b-${player.id}-1`, seed, false);

    const extraBoards: Board5x5[] = [];
    for (let i = 2; i <= cardCount; i++) {
      extraBoards.push(generate5x5Board(`b-${player.id}-${i}`, `${seed}-${i}`, false));
    }

    const pool = generate5x5NumberPool();

    setGameMode(mode);
    setBoard(primaryBoard);
    setAdditionalBoards(extraBoards);
    setNumberPool(pool);
    setDrawnNumbers([]);
    setScore(0);
    setLinesCompletedCount(0);
    setCompletedPatternIds([]);
    setLastCompletedPatternName(undefined);
    setClaimFeedback(null);
    setIsGameActive(true);
    setIsPaused(false);
    setMatchStartTime(Date.now());

    if (mode === 'ROBOT') {
      robotRef.current = new RobotOpponent('MEDIUM', `robot-${seed}`);
      setRobotLines(0);
    } else {
      robotRef.current = null;
    }

    setScreenState('GAMEPLAY');
  }, [player.id]);

  // Launchers
  const handlePlayRandomPlayer = async () => {
    setGameMode('RANKED');
    setMatchmakingStatus('SEARCHING');
    setMatchedOpponent(null);
    setMatchCountdown(null);
    setScreenState('MATCHMAKING');

    await globalMatchmakingService.requestRandomMatch(player, 'RANKED', {
      onStatusChange: (status) => {
        setMatchmakingStatus(status);
      },
      onOpponentFound: (opponent, gameSessionId, isHost) => {
        setMatchedOpponent(opponent);
        setMatchmakingStatus('MATCH_FOUND');
        multiplayer.joinDirectMatchSession(gameSessionId, opponent, isHost);
      },
      onCountdownTick: (sec) => {
        setMatchCountdown(sec);
      },
      onError: () => {
        setMatchmakingStatus('IDLE');
        setScreenState('TAB_NAV');
      },
    });
  };

  const handleCancelMatchmaking = async () => {
    await globalMatchmakingService.cancelMatchmaking();
    setMatchmakingStatus('IDLE');
    setMatchedOpponent(null);
    setMatchCountdown(null);
    setScreenState('TAB_NAV');
  };

  const handlePlayRanked = () => handlePlayRandomPlayer();

  const handlePlayRobot = (difficulty: RobotDifficulty) => {
    const seed = `game-robot-${Date.now()}`;
    const primaryBoard = generate5x5Board(`b-${player.id}`, seed, false);
    const pool = generate5x5NumberPool();

    setGameMode('ROBOT');
    setBoard(primaryBoard);
    setAdditionalBoards([]);
    setNumberPool(pool);
    setDrawnNumbers([]);
    setScore(0);
    setLinesCompletedCount(0);
    setCompletedPatternIds([]);
    setLastCompletedPatternName(undefined);
    setClaimFeedback(null);
    setIsGameActive(true);
    setIsPaused(false);
    setMatchStartTime(Date.now());

    robotRef.current = new RobotOpponent(difficulty, `robot-${seed}`);
    setRobotLines(0);
    setCurrentTurnPlayerId(player.id);
    setTurnExpiresAt(Date.now() + 10000); // 10 seconds timeout
    setScreenState('GAMEPLAY');
  };

  const handleLocalPlay = () => initGame('LOCAL', 1);

  const handleDailyPuzzle = () => setScreenState('DAILY_PUZZLE');

  const handleStartDaily = (seed: string) => initGame('DAILY', 1, seed);

  const handlePlayFriend = () => {
    setGameMode('FRIEND');
    multiplayer.resetToIdle();
    setScreenState('ROOMS');
  };

  const handleCreateRoom = async (name: string = 'Friendly Arena', privacy: RoomPrivacy = 'open', password?: string) => {
    setGameMode('FRIEND');
    multiplayer.createRoom(name, privacy, password);
  };

  const handleJoinRoom = async (roomId: string, password?: string) => {
    setGameMode('FRIEND');
    await multiplayer.joinRoom(roomId, password);
  };

  const handleSelectRoom = (room: PublicRoom, ticketCount?: number) => {
    setSelectedRoom(room);
    if (ticketCount) {
      setPurchasedCardsCount(ticketCount);
    }
    setScreenState('PRE_GAME');
  };

  const handleBuyTickets = (cardCount: number) => {
    const totalCost = selectedRoom ? selectedRoom.ticketPrice * cardCount : 0;
    
    if (player.coins < totalCost) {
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        window.alert(`Insufficient coins. You need 🪙 ${totalCost} to enter this room.`);
      } else {
        Alert.alert('Insufficient Coins', `You need 🪙 ${totalCost} to enter this room.`);
      }
      return;
    }

    if (totalCost > 0) {
      setPlayer((prev) => ({ ...prev, coins: prev.coins - totalCost }));
    }

    setPurchasedCardsCount(cardCount);
    initGame('LOCAL', cardCount);
  };

  const handleClaimDailyBonus = () => {
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + 500,
      gems: prev.gems + 10,
    }));
    setShowDailyBonusModal(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBuyStoreItem = (item: StoreItem) => {
    if (item.category === 'COINS') {
      const addedCoins = item.id === 'c1' ? 500 : item.id === 'c2' ? 2500 : 10000;
      setPlayer((prev) => ({ ...prev, coins: prev.coins + addedCoins }));
    } else if (item.category === 'GEMS') {
      const addedGems = item.id === 'g1' ? 50 : 250;
      setPlayer((prev) => ({ ...prev, gems: prev.gems + addedGems }));
    } else if (item.costInGems && player.gems >= item.costInGems) {
      setPlayer((prev) => ({ ...prev, gems: prev.gems - item.costInGems! }));
    }
  };

  // Solo Cell Press Handler
  const handleCellPress = useCallback(
    (cell: GridCell5x5, boardIndex: number = 0) => {
      const targetBoard = boardIndex === 0 ? board : additionalBoards[boardIndex - 1];
      if (!targetBoard || !isGameActive) return;
      if (cell.state === 'MARKED' || cell.state === 'COMPLETED') return;
      
      let justCalled = false;

      if (gameMode === 'ROBOT') {
        if (currentTurnPlayerId !== player.id) {
          SoundEngine.playError();
          return;
        }

        const isAlreadyCalled = drawnNumbers.includes(cell.value);
        if (!isAlreadyCalled) {
          justCalled = true;
          // Player calls a new number
          setDrawnNumbers((prevCalls) => [cell.value, ...prevCalls]);
          SoundEngine.playBallDrawn();
          SoundEngine.speakNumber(cell.value);

          // Remove from pool if it was there
          setNumberPool((prev) => prev.filter((n) => n !== cell.value));
        }
      } else {
        const isLegitCalled = AntiCheatValidator.validateDaub(cell.value, drawnNumbers);
        if (!isLegitCalled) {
          SoundEngine.playError();
          setClaimFeedback({
            success: false,
            message: `Number ${cell.value} has not been called yet!`,
          });
          setTimeout(() => setClaimFeedback(null), 1400);
          return;
        }
      }

      const newMatrix = targetBoard.matrix.map((row) =>
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
        ...targetBoard,
        matrix: newMatrix,
      };

      if (boardIndex === 0) setBoard(updatedBoard);
      else {
        setAdditionalBoards((prev) => {
          const next = [...prev];
          next[boardIndex - 1] = updatedBoard;
          return next;
        });
      }

      SoundEngine.playDaub();

      const winResult = evaluate5x5Wins(updatedBoard, completedPatternIds);
      if (winResult.newlyCompletedPatterns.length > 0) {
        SoundEngine.playLineCompleted();
        const newPatternIds = winResult.newlyCompletedPatterns.map((p) => p.id);
        const lastPattern = winResult.newlyCompletedPatterns[winResult.newlyCompletedPatterns.length - 1];

        setCompletedPatternIds((prev) => [...prev, ...newPatternIds]);
        setLinesCompletedCount((prev) => prev + winResult.newlyCompletedPatterns.length);
        setLastCompletedPatternName(lastPattern.name);
        setScore((prev) => prev + winResult.newlyCompletedPatterns.length * 500);

        winResult.winningCoords.forEach(({ row, col }) => {
          updatedBoard.matrix[row][col].isWinningCell = true;
          updatedBoard.matrix[row][col].state = 'COMPLETED';
        });

        setTimeout(() => setLastCompletedPatternName(undefined), 2500);
      }

      if (gameMode === 'ROBOT' && justCalled) {
        // Pass turn to AI
        if (robotRef.current) {
          robotRef.current.onNumberCalled(cell.value, (_r, _c, robotLinesCount) => {
            setRobotLines(robotLinesCount);
            if (robotLinesCount >= 5) {
              setIsGameActive(false);
              setMatchDuration(Math.floor((Date.now() - matchStartTime) / 1000));
              applyMatchOutcome(false, 'ROBOT', score, linesCompletedCount, -15);
              setClaimFeedback({
                success: false,
                message: 'The Robot called BINGO before you!',
              });
              setTimeout(() => setScreenState('RESULTS'), 3000);
            }
          });
        }
        setCurrentTurnPlayerId('ROBOT');
        setTurnExpiresAt(Date.now() + 10000);
      }
    },
    [board, additionalBoards, isGameActive, drawnNumbers, completedPatternIds, gameMode, currentTurnPlayerId, player.id, matchStartTime, linesCompletedCount, score]
  );

  // Solo Claim Bingo
  const handleClaimBingo = useCallback(() => {
    if (!board || !isGameActive) return;

    if (linesCompletedCount < 5) {
      SoundEngine.playError();
      setClaimFeedback({
        success: false,
        message: 'You need 5 completed lines to claim BINGO!',
      });
      setTimeout(() => setClaimFeedback(null), 2000);
      return;
    }

    SoundEngine.playWinFanfare();
    setIsGameActive(false);
    setMatchDuration(Math.floor((Date.now() - matchStartTime) / 1000));
    if (callerIntervalRef.current) clearInterval(callerIntervalRef.current);

    applyMatchOutcome(true, gameMode, score, linesCompletedCount, 20);
    setScreenState('RESULTS');
  }, [board, isGameActive, linesCompletedCount, score, matchStartTime, gameMode]);

  useEffect(() => {
    // Only upsert if it's an authenticated Supabase user profile
    if (!player.id.startsWith('player-')) {
      leaderboardService.upsertPlayer(player);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.rating, player.tier]);

  // Turn-based logic & timeouts for AI Mode
  useEffect(() => {
    if (gameMode === 'ROBOT' && screenState === 'GAMEPLAY' && isGameActive && !isPaused) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (turnExpiresAt && now > turnExpiresAt) {
          // Timeout reached
          if (currentTurnPlayerId === player.id) {
            // Player timed out -> player loses
            setIsGameActive(false);
            setMatchDuration(Math.floor((now - matchStartTime) / 1000));
            setClaimFeedback({
              success: false,
              message: 'Turn timed out! You lose.',
            });
            applyMatchOutcome(false, 'ROBOT', score, linesCompletedCount, -20);
            setTimeout(() => setScreenState('RESULTS'), 2000);
          } else {
            // Robot timed out -> shouldn't happen, but pass turn to player to unblock
            setCurrentTurnPlayerId(player.id);
            setTurnExpiresAt(now + 10000);
          }
        }
      }, 1000);

      // AI turn execution logic
      if (currentTurnPlayerId === 'ROBOT' && turnExpiresAt) {
        // Simulate some thinking time (1.5s to 3s)
        const thinkingTime = Math.random() * 1500 + 1500;
        const aiTimeout = setTimeout(() => {
          if (!isGameActive || isPaused) return;
          // Pick a random uncalled number
          setNumberPool((prevPool) => {
            if (prevPool.length === 0) return prevPool;
            const nextNumber = prevPool[Math.floor(Math.random() * prevPool.length)];
            const remaining = prevPool.filter((n) => n !== nextNumber);

            setDrawnNumbers((prevCalls) => [nextNumber, ...prevCalls]);
            SoundEngine.playBallDrawn();
            SoundEngine.speakNumber(nextNumber);

            if (robotRef.current) {
              robotRef.current.onNumberCalled(nextNumber, (_r, _c, robotLinesCount) => {
                setRobotLines(robotLinesCount);
                if (robotLinesCount >= 5) {
                  setIsGameActive(false);
                  setMatchDuration(Math.floor((Date.now() - matchStartTime) / 1000));
                  leaderboardService.recordMatchResult(player.id, false, 'ROBOT', score, linesCompletedCount, -15);
                  setPlayer(prev => ({ ...prev, coins: Math.max(0, prev.coins - 500) }));
                  setScreenState('RESULTS');
                }
              });
            }

            // Auto-daub for player if they have it (in traditional vs AI we just give it back to player)
            // But wait, if AI calls it, player usually has to daub it manually.
            // For turn-based, let's let the player daub it manually, but pass the turn to player!
            // BUT, if we pass turn to player, the player might just call a new number without daubing the AI's number!
            // In Tic-Tac-Toe bingo, you just call it and it auto-daubs. Let's auto-daub for player to keep it simple, OR 
            // the player just has to notice. Actually, the player's board is auto-daubed in most digital games. Let's not auto daub. Player can daub it.
            
            // Wait, we need to pass the turn to the player
            setCurrentTurnPlayerId(player.id);
            setTurnExpiresAt(Date.now() + 10000);
            return remaining;
          });
        }, thinkingTime);
        return () => {
          clearInterval(interval);
          clearTimeout(aiTimeout);
        };
      }

      return () => clearInterval(interval);
    } else if (gameMode !== 'FRIEND' && gameMode !== 'ROBOT' && screenState === 'GAMEPLAY' && isGameActive && !isPaused) {
      // Legacy Automated caller for LOCAL / DAILY
      callerIntervalRef.current = setInterval(() => {
        setNumberPool((prevPool) => {
          if (prevPool.length === 0) {
            if (callerIntervalRef.current) clearInterval(callerIntervalRef.current);
            return prevPool;
          }
          const nextNumber = prevPool[0];
          const remaining = prevPool.slice(1);
          setDrawnNumbers((prevCalls) => [nextNumber, ...prevCalls]);
          SoundEngine.playBallDrawn();
          SoundEngine.speakNumber(nextNumber);
          return remaining;
        });
      }, 3500);

      return () => {
        if (callerIntervalRef.current) clearInterval(callerIntervalRef.current);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode, screenState, isGameActive, isPaused, matchStartTime, currentTurnPlayerId, turnExpiresAt, player.id]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgCanvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
        {screenState === 'SPLASH' && (
          <SplashScreen
            onFinish={() => {
              if (authStatus === 'AUTHENTICATED') {
                setScreenState('TAB_NAV');
              } else {
                setScreenState('SIGN_IN');
              }
            }}
          />
        )}

        {screenState === 'SIGN_IN' && (
          <SignInScreen
            currentName={player.name}
            onLogin={(name, userId) => {
              const activeId = userId || player.id;
              setPlayer((prev) => ({ ...prev, name, id: activeId }));
              AsyncStorage.setItem('bingo_user_session', JSON.stringify({ userId: activeId, name }));
              setScreenState('TAB_NAV');
            }}
          />
        )}



        {screenState === 'TAB_NAV' && (
          <>
            {currentTab === 'PLAY' && (
              <HomeScreen
                player={player}
                onPlayRandomPlayer={handlePlayRandomPlayer}
                onPlayRanked={handlePlayRanked}
                onPlayRobot={handlePlayRobot}
                onPlayFriend={handlePlayFriend}
                onDailyPuzzle={handleDailyPuzzle}
                onLocalPlay={handleLocalPlay}
                onJoinRoom={(roomId) => handleJoinRoom(roomId)}
                onCreateRoomDirect={handlePlayFriend}
                onOpenSettings={() => setScreenState('SETTINGS')}
                onOpenRoomSelection={() => setScreenState('ROOM_SELECTION')}
                onOpenDailyBonusModal={() => setShowDailyBonusModal(true)}
              />
            )}

            {currentTab === 'LEADERBOARD' && <LeaderboardScreen player={player} />}

            {currentTab === 'PROFILE' && (
              <ProfileScreen
                playerId={player.id}
                playerName={player.name}
                rating={player.rating}
                tier={player.tier}
                coins={player.coins}
                gems={player.gems}
                onUpdateName={(name) => setPlayer((prev) => ({ ...prev, name }))}
                onOpenSettings={() => setScreenState('SETTINGS')}
                onLogout={handleLogout}
                onNavigateDeleteAccount={() => setScreenState('DELETE_ACCOUNT')}
              />
            )}

            <BottomNavBar currentTab={currentTab} onSelectTab={setCurrentTab} />
          </>
        )}

        {screenState === 'DELETE_ACCOUNT' && (
          <DeleteAccountScreen
            onCancel={() => setScreenState('TAB_NAV')}
            onAccountDeleted={handleLogout}
          />
        )}

        {screenState === 'MATCHMAKING' && (
          <MatchmakingScreen
            player={player}
            opponent={matchedOpponent}
            status={matchmakingStatus}
            countdownSeconds={matchCountdown}
            onCancel={handleCancelMatchmaking}
          />
        )}

        {screenState === 'ROOM_SELECTION' && (
          <RoomSelectionScreen
            coins={player.coins}
            gems={player.gems}
            onSelectRoom={handleSelectRoom}
            onBack={() => setScreenState('TAB_NAV')}
          />
        )}

        {screenState === 'PRE_GAME' && selectedRoom && (
          <PreGameScreen
            room={selectedRoom}
            userBalanceCoins={player.coins}
            onBuyTickets={handleBuyTickets}
            onBack={() => setScreenState('ROOM_SELECTION')}
          />
        )}

        {screenState === 'ROOMS' && (
          <RoomPage
            player={player}
            room={multiplayer.room}
            players={multiplayer.players}
            pageState={multiplayer.roomPageState}
            isHost={multiplayer.isHost}
            canStart={multiplayer.canStart}
            countdownSeconds={multiplayer.countdownSeconds}
            errorMessage={multiplayer.joinError}
            onCreateRoom={(name) => handleCreateRoom(name, 'open')}
            onJoinRoom={(code) => handleJoinRoom(code)}
            onStartMatch={multiplayer.startMatch}
            onExitRoom={multiplayer.leaveRoom}
            onBackToRooms={multiplayer.resetToIdle}
            onBackToLobby={() => {
              multiplayer.leaveRoom();
              setScreenState('TAB_NAV');
            }}
          />
        )}

        {screenState === 'CREATE_ROOM' && (
          <CreateRoomScreen
            onCreateRoom={handleCreateRoom}
            onBack={() => setScreenState('TAB_NAV')}
          />
        )}

        {screenState === 'JOIN_ROOM' && (
          <JoinRoomScreen
            onJoin={handleJoinRoom}
            onBack={() => setScreenState('TAB_NAV')}
            errorMessage={multiplayer.joinError}
          />
        )}

        {screenState === 'DAILY_PUZZLE' && (
          <DailyPuzzleScreen
            onStartDaily={handleStartDaily}
            onBack={() => setScreenState('TAB_NAV')}
          />
        )}

        {screenState === 'SETTINGS' && (
          <SettingsScreen onBack={() => setScreenState('TAB_NAV')} />
        )}

        {screenState === 'LOBBY' && gameMode === 'FRIEND' && multiplayer.room ? (
          <LobbyScreen
            room={multiplayer.room}
            player={player}
            players={multiplayer.players}
            countdownSeconds={multiplayer.countdownSeconds}
            onStartMatch={multiplayer.startMatch}
            onLeaveLobby={multiplayer.leaveRoom}
            onToggleReady={multiplayer.toggleReady}
            onLaunchRobotMatch={() => {
              multiplayer.leaveRoom();
              handlePlayRobot('MEDIUM');
            }}
          />
        ) : null}

        {screenState === 'GAMEPLAY' && (
          (multiplayer.board || board) ? (
            <GameplayScreen
              board={multiplayer.board || board!}
              additionalBoards={additionalBoards}
              drawnNumbers={multiplayer.room ? multiplayer.drawnNumbers : drawnNumbers}
              score={multiplayer.room ? multiplayer.score : score}
              linesCompletedCount={multiplayer.room ? multiplayer.linesCompletedCount : linesCompletedCount}
              isGameActive={multiplayer.room ? multiplayer.isGameActive : isGameActive}
              isPaused={multiplayer.room ? multiplayer.isPaused : isPaused}
              onCellPress={(cell, bIdx) => {
                if (multiplayer.room) {
                  multiplayer.daubCell(cell);
                } else {
                  handleCellPress(cell, bIdx);
                }
              }}
              onClaimBingo={() => {
                if (multiplayer.room) {
                  multiplayer.claimBingo();
                } else {
                  handleClaimBingo();
                }
              }}
              onTogglePause={() => {
                if (multiplayer.room) {
                  multiplayer.togglePause();
                } else {
                  setIsPaused(!isPaused);
                }
              }}
              onLeaveGame={() => {
                if (multiplayer.room) {
                  multiplayer.leaveRoom();
                } else {
                  setIsGameActive(false);
                  setScreenState('TAB_NAV');
                }
              }}
              lastCompletedPatternName={multiplayer.room ? multiplayer.lastCompletedPatternName : lastCompletedPatternName}
              claimFeedback={multiplayer.room ? multiplayer.claimFeedback : claimFeedback}
              opponentLines={gameMode === 'ROBOT' ? robotLines : (multiplayer.room ? multiplayer.opponentLines : undefined)}
              opponentName={gameMode === 'ROBOT' ? 'Robot AI' : (multiplayer.room ? multiplayer.opponentName : undefined)}
              currentTurnPlayerId={multiplayer.room ? multiplayer.currentTurnPlayerId : (gameMode === 'ROBOT' ? currentTurnPlayerId : undefined)}
              turnExpiresAt={multiplayer.room ? multiplayer.turnExpiresAt : (gameMode === 'ROBOT' ? turnExpiresAt : undefined)}
              playerId={player.id}
            />
          ) : null
        )}

        {screenState === 'RESULTS' && (
          <ResultsScreen
            hasWon={
              multiplayer.room 
                ? multiplayer.winner?.id === player.id 
                : linesCompletedCount >= 5
            }
            score={multiplayer.room ? multiplayer.score : score}
            linesCompletedCount={multiplayer.room ? multiplayer.linesCompletedCount : linesCompletedCount}
            totalCallsCount={multiplayer.room ? multiplayer.drawnNumbers.length : drawnNumbers.length}
            matchDurationSec={multiplayer.room ? multiplayer.matchDuration : matchDuration}
            coinDelta={
              (multiplayer.room ? multiplayer.winner?.id === player.id : linesCompletedCount >= 5) ? 1500 : -500
            }
            winnerName={
              multiplayer.room 
                ? multiplayer.winner?.name 
                : (gameMode === 'ROBOT' && linesCompletedCount < 5 ? 'Robot AI' : player.name)
            }
            isMultiplayer={multiplayer.room !== null || gameMode === 'ROBOT'}
            onPlayAgain={() => {
              if (multiplayer.room) {
                multiplayer.requestRematch();
              } else {
                initGame(gameMode, purchasedCardsCount);
              }
            }}
            onReturnHome={() => {
              if (multiplayer.room) {
                multiplayer.leaveRoom();
              } else {
                setScreenState('TAB_NAV');
              }
            }}
          />
        )}

        {/* Daily Bonus Modal Overlay */}
        <DailyBonusModal
          visible={showDailyBonusModal}
          onClaim={handleClaimDailyBonus}
          onClose={() => setShowDailyBonusModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    position: 'relative',
  },
});
