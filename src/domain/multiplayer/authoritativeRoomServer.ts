/**
 * Authoritative Room Server & Game Controller
 * Owns the authoritative match timeline, player registration, board assignment,
 * ball caller ticker, win claim verification, and rematch synchronization.
 * Runs on the host peer (or backend server) and synchronizes with clients via RoomTransport.
 */

import { PublicRoom, Player, Board5x5 } from '../types';
import { RoomTransport, TransportMessage } from './transport';
import {
  generate5x5Board,
  generate5x5NumberPool,
} from '../engine/gridGameEngine';
import { AntiCheatValidator, WinClaimPayload } from './antiCheatValidator';

export interface AuthoritativeRoomSnapshot {
  room: PublicRoom;
  players: Player[];
  status: PublicRoom['status'];
  drawnNumbers: number[];
  currentCall?: number;
  seed: string;
  winner?: { id: string; name: string } | null;
  matchDurationSec: number;
  currentTurnPlayerId?: string;
  turnExpiresAt?: number;
}

export class AuthoritativeRoomServer {
  private room: PublicRoom;
  private transport: RoomTransport;
  private players: Map<string, Player> = new Map();
  private boards: Map<string, Board5x5> = new Map();
  private seed: string;
  private numberPool: number[] = [];
  private drawnNumbers: number[] = [];
  private callerInterval: any = null;
  private matchStartTime = 0;
  private winner: { id: string; name: string } | null = null;
  private unsubscribeTransport: (() => void) | null = null;
  private isDestroyed = false;

  private currentTurnPlayerId: string | undefined;
  private turnExpiresAt: number | undefined;
  private turnTimerInterval: any = null;
  private readonly TURN_DURATION_MS = 10000;

  constructor(room: PublicRoom, hostPlayer: Player, transport: RoomTransport) {
    this.room = { ...room };
    this.transport = transport;
    this.seed = `match-${room.id}-${Date.now()}`;

    // Register host
    const host: Player = {
      ...hostPlayer,
      isHost: true,
      isReady: true,
      score: 0,
      linesCompleted: 0,
      hasWon: false,
    };
    this.players.set(host.id, host);

    // Bind transport message listeners
    console.log('[RoomServer] Initializing transport subscription');
    this.unsubscribeTransport = this.transport.subscribe(this.handleClientMessage);

    // Broadcast room existence
    this.broadcastRoomAnnounce();
  }

  public getSnapshot(): AuthoritativeRoomSnapshot {
    return {
      room: {
        ...this.room,
        playerCount: this.players.size,
      },
      players: Array.from(this.players.values()),
      status: this.room.status,
      drawnNumbers: [...this.drawnNumbers],
      currentCall: this.drawnNumbers[0],
      seed: this.seed,
      winner: this.winner,
      matchDurationSec: this.matchStartTime > 0 ? Math.floor((Date.now() - this.matchStartTime) / 1000) : 0,
      currentTurnPlayerId: this.currentTurnPlayerId,
      turnExpiresAt: this.turnExpiresAt,
    };
  }

  public getPlayerBoard(playerId: string): Board5x5 {
    if (!this.boards.has(playerId)) {
      const board = generate5x5Board(`b-${playerId}`, `${this.seed}-${playerId}`, false);
      this.boards.set(playerId, board);
    }
    return this.boards.get(playerId)!;
  }

  /**
   * Directly launch an authoritative 2-player match when formed via Matchmaking.
   */
  public startDirectMatch(opponentPlayer: Player) {
    this.players.set(opponentPlayer.id, {
      ...opponentPlayer,
      isHost: false,
      isReady: true,
      score: 0,
      linesCompleted: 0,
      hasWon: false,
    });
    this.getPlayerBoard(opponentPlayer.id);

    this.room.status = 'ACTIVE';
    this.room.playerCount = this.players.size;
    this.numberPool = generate5x5NumberPool();
    this.drawnNumbers = [];
    this.winner = null;
    this.matchStartTime = Date.now();

    // Assign first turn randomly or to host
    const playerIds = Array.from(this.players.keys());
    this.currentTurnPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    this.turnExpiresAt = Date.now() + this.TURN_DURATION_MS;

    // Broadcast instant match start to all clients after a brief delay
    // This delay ensures the guest client has successfully connected to the websocket
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.transport.send('MATCH_STARTED', this.room.id, this.room.hostId, {
        snapshot: this.getSnapshot(),
      });

      // Start turn timeout checker
      this.startTurnTimer();
    }, 2500);
  }

  private broadcastRoomAnnounce() {
    this.transport.send('ROOM_ANNOUNCE', this.room.id, this.room.hostId, this.getSnapshot(), this.room.hostName);
  }

  private handleClientMessage = (message: TransportMessage) => {
    console.log('[RoomServer] Received transport message:', message);
    if (this.isDestroyed) {
      console.warn('[RoomServer] Ignoring message because server is destroyed');
      return;
    }
    if (message.roomId.toUpperCase() !== this.room.id.toUpperCase()) {
      console.warn(`[RoomServer] Message roomId mismatch (expected ${this.room.id}, got ${message.roomId})`);
      return;
    }
    if (this.isDestroyed || message.roomId.toUpperCase() !== this.room.id.toUpperCase()) return;

    switch (message.type) {
      case 'JOIN_REQUEST':
        this.handleJoinRequest(message);
        break;
      case 'PLAYER_READY_TOGGLE':
        this.handleReadyToggle(message);
        break;
      case 'START_COUNTDOWN':
        this.handleStartMatch(message);
        break;
      case 'MATCH_STARTED':
        // Wait, handleStartMatch is below? No it's START_COUNTDOWN that handles it.
        break;
      case 'CALL_NUMBER_REQUEST':
        this.handleCallNumberRequest(message);
        break;
      case 'OPPONENT_PROGRESS':
        this.handleOpponentProgress(message);
        break;
      case 'CLAIM_BINGO_REQUEST':
        this.handleClaimBingo(message);
        break;
      case 'MATCH_FORFEIT':
        this.handleForfeit(message);
        break;
      case 'REMATCH_REQUEST':
        this.handleRematch(message);
        break;
      case 'SYNC_STATE_REQUEST':
        this.handleSyncRequest(message);
        break;
      case 'HEARTBEAT_PING':
        this.transport.send('HEARTBEAT_PONG', this.room.id, this.room.hostId, { timestamp: Date.now() });
        break;
      case 'ROOM_CLOSED':
        this.destroy();
        break;
    }
  };

  private handleJoinRequest(message: TransportMessage<{ player: Player; password?: string }>) {
    console.log('[RoomServer] Handling JOIN_REQUEST from player', message.payload?.player?.id);
    const { player, password } = message.payload;

    // Check destroyed or closed status
    if (this.isDestroyed || this.room.status === 'CLOSED') {
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'This room is closed.',
      });
      return;
    }

    // Check expiry (e.g. 15 minutes = 900,000 ms)
    const isExpired = this.room.status === 'EXPIRED' || (Date.now() - this.room.createdAt > 300000);
    if (isExpired) {
      this.room.status = 'EXPIRED';
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'This room has expired.',
      });
      return;
    }

    // Check same-user protection: host cannot join their own room as second player
    if (player.id === this.room.hostId) {
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'You already own this room.',
      });
      return;
    }

    // Check if already in room
    if (this.players.has(player.id)) {
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'You are already in this room.',
      });
      return;
    }

    // Check capacity (strictly max 2 players: 1 host + 1 opponent)
    if (this.players.size >= 2) {
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'This room is full.',
      });
      return;
    }

    // Check match status
    if (this.room.status !== 'WAITING') {
      this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
        success: false,
        targetPlayerId: player.id,
        error: 'Match in this room is already in progress or concluded.',
      });
      return;
    }

    // Check password if required
    if (this.room.privacy === 'password' && this.room.passwordHash) {
      // Basic match validation
      if (!password) {
        this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
          success: false,
          targetPlayerId: player.id,
          error: 'Password required to join this room.',
        });
        return;
      }
    }

    // Register player
    const newPlayer: Player = {
      ...player,
      isHost: player.id === this.room.hostId,
      isReady: true, // Everyone is ready by default when they join
      score: 0,
      linesCompleted: 0,
      hasWon: false,
    };
    this.players.set(newPlayer.id, newPlayer);
    this.room.playerCount = this.players.size;

    // Generate authoritative board for player
    const board = this.getPlayerBoard(newPlayer.id);

    // Respond with success snapshot
    this.transport.send('JOIN_RESPONSE', this.room.id, this.room.hostId, {
      success: true,
      targetPlayerId: newPlayer.id,
      snapshot: this.getSnapshot(),
      board,
    });

    // Notify all peers of updated lobby
    this.broadcastRoomAnnounce();
  }

  private handleReadyToggle(message: TransportMessage<{ playerId: string; isReady: boolean }>) {
    const { playerId, isReady } = message.payload;
    const p = this.players.get(playerId);
    if (p) {
      p.isReady = isReady;
      this.broadcastRoomAnnounce();
    }
  }

  private handleStartMatch(message: TransportMessage) {
    if (message.senderId !== this.room.hostId) {
      return; // Only host can trigger start
    }

    // Verify all non-host players are ready
    const allReady = Array.from(this.players.values()).every((p) => p.isHost || p.isReady);
    if (!allReady || this.players.size < 2) {
      return;
    }

    if (this.room.status === 'ACTIVE') {
      return; // Prevent infinite loop of START_COUNTDOWN broadcasts
    }

    // Update room status
    this.room.status = 'ACTIVE';
    this.numberPool = generate5x5NumberPool();
    this.drawnNumbers = [];
    this.winner = null;
    this.matchStartTime = Date.now();

    // Broadcast match starting
    this.transport.send('START_COUNTDOWN', this.room.id, this.room.hostId, {
      seconds: 3,
      snapshot: this.getSnapshot(),
    });

    // After 3 seconds, start ball caller interval
    setTimeout(() => {
      if (this.isDestroyed || this.room.status !== 'ACTIVE') return;

      // Assign first turn randomly or to host
      const playerIds = Array.from(this.players.keys());
      this.currentTurnPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
      this.turnExpiresAt = Date.now() + this.TURN_DURATION_MS;

      this.transport.send('MATCH_STARTED', this.room.id, this.room.hostId, {
        snapshot: this.getSnapshot(),
      });

      this.startBallCaller();
      this.startTurnTimer();
    }, 3000);
  }

  private startTurnTimer() {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
    }

    this.turnTimerInterval = setInterval(() => {
      if (this.room.status !== 'ACTIVE' || this.isDestroyed || this.winner) {
        clearInterval(this.turnTimerInterval);
        return;
      }

      if (this.turnExpiresAt && Date.now() >= this.turnExpiresAt) {
        // Current player timed out! Opponent wins.
        clearInterval(this.turnTimerInterval);

        const opponentId = Array.from(this.players.keys()).find(id => id !== this.currentTurnPlayerId);
        const opponent = opponentId ? this.players.get(opponentId) : null;

        if (opponent) {
          this.winner = { id: opponent.id, name: opponent.name };
          opponent.hasWon = true;
          this.room.status = 'CLOSED';

          this.transport.send('WINNER_DECLARED', this.room.id, this.room.hostId, {
            winnerId: opponent.id,
            winnerName: opponent.name,
            reason: 'Opponent timed out',
            snapshot: this.getSnapshot(),
          });
        }
      }
    }, 1000);
  }

  private startBallCaller() {
    // Automatic timer is disabled for manual turn-based calling.
    // Numbers are now drawn when a client sends CALL_NUMBER_REQUEST.
    if (this.callerInterval) {
      clearInterval(this.callerInterval);
      this.callerInterval = null;
    }
  }

  private handleCallNumberRequest(message: TransportMessage<{ number: number }>) {
    if (this.room.status !== 'ACTIVE' || this.isDestroyed || this.winner) return;

    // Verify it's the sender's turn
    if (this.currentTurnPlayerId && message.senderId !== this.currentTurnPlayerId) {
      console.warn(`[RoomServer] Ignored CALL_NUMBER_REQUEST from ${message.senderId}: not their turn.`);
      return;
    }

    const requestedNumber = message.payload.number;

    // Check if it was already drawn to prevent duplicates
    if (this.drawnNumbers.includes(requestedNumber)) return;

    // Add to drawn numbers list
    this.drawnNumbers.unshift(requestedNumber);

    // Remove it from the numberPool so it isn't drawn again if we re-enable automatic calling
    this.numberPool = this.numberPool.filter(n => n !== requestedNumber);

    // Switch turns
    const opponentId = Array.from(this.players.keys()).find(id => id !== message.senderId);
    if (opponentId) {
      this.currentTurnPlayerId = opponentId;
      this.turnExpiresAt = Date.now() + this.TURN_DURATION_MS;
    }

    // Broadcast the newly called number to all players (including the sender via loopback)
    this.transport.send('NUMBER_DRAWN', this.room.id, this.room.hostId, {
      number: requestedNumber,
      drawnNumbers: [...this.drawnNumbers],
      remaining: this.numberPool.length,
      callOrder: this.drawnNumbers.length,
      nextTurnPlayerId: this.currentTurnPlayerId,
      turnExpiresAt: this.turnExpiresAt,
    });
  }

  private handleOpponentProgress(message: TransportMessage<{ linesCompleted: number; score: number }>) {
    const p = this.players.get(message.senderId);
    if (p) {
      p.linesCompleted = message.payload.linesCompleted;
      p.score = message.payload.score;
    }
  }

  private handleClaimBingo(message: TransportMessage<WinClaimPayload>) {
    if (this.room.status !== 'ACTIVE') return;

    const claim = message.payload;
    const playerBoard = this.boards.get(claim.playerId);

    if (!playerBoard) {
      this.transport.send('CLAIM_VERIFICATION_RESULT', this.room.id, this.room.hostId, {
        success: false,
        reason: 'Player board not found in server registry.',
        targetPlayerId: claim.playerId,
      });
      return;
    }

    // Authoritative anti-cheat validation
    const result = AntiCheatValidator.validateClaim(claim, playerBoard, this.drawnNumbers);

    if (result.isValid) {
      // Freeze match immediately
      if (this.callerInterval) clearInterval(this.callerInterval);
      this.room.status = 'RESULT';

      const player = this.players.get(claim.playerId);
      const winnerName = player?.name || 'Player';
      this.winner = { id: claim.playerId, name: winnerName };

      if (player) {
        player.hasWon = true;
      }

      // Broadcast victory
      this.transport.send('WINNER_DECLARED', this.room.id, this.room.hostId, {
        winnerId: claim.playerId,
        winnerName,
        validatedPatterns: result.validatedPatterns,
        matchDurationSec: Math.floor((Date.now() - this.matchStartTime) / 1000),
        snapshot: this.getSnapshot(),
      });
    } else {
      this.transport.send('CLAIM_VERIFICATION_RESULT', this.room.id, this.room.hostId, {
        success: false,
        reason: result.reason || 'Invalid win claim.',
        targetPlayerId: claim.playerId,
      });
    }
  }

  private handleForfeit(message: TransportMessage) {
    if (this.callerInterval) clearInterval(this.callerInterval);
    this.room.status = 'RESULT';

    // Other player wins
    const otherPlayer = Array.from(this.players.values()).find((p) => p.id !== message.senderId);
    if (otherPlayer) {
      this.winner = { id: otherPlayer.id, name: otherPlayer.name };
      otherPlayer.hasWon = true;
    }

    this.transport.send('WINNER_DECLARED', this.room.id, this.room.hostId, {
      winnerId: this.winner?.id || 'none',
      winnerName: this.winner?.name || 'Forfeit',
      forfeitedBy: message.senderId,
      snapshot: this.getSnapshot(),
    });
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleRematch(message: TransportMessage) {
    if (this.callerInterval) clearInterval(this.callerInterval);

    // Reset room state
    this.room.status = 'WAITING';
    this.seed = `match-${this.room.id}-${Date.now()}`;
    this.numberPool = [];
    this.drawnNumbers = [];
    this.winner = null;
    this.matchStartTime = 0;
    this.boards.clear();

    // Reset players ready state except host
    this.players.forEach((p) => {
      p.hasWon = false;
      p.linesCompleted = 0;
      p.score = 0;
      p.isReady = true; // Everyone is ready by default for the rematch
    });

    this.transport.send('REMATCH_CONFIRMED', this.room.id, this.room.hostId, {
      snapshot: this.getSnapshot(),
    });

    this.broadcastRoomAnnounce();
  }

  private handleSyncRequest(message: TransportMessage) {
    this.transport.send('SYNC_STATE_RESPONSE', this.room.id, this.room.hostId, {
      targetPlayerId: message.senderId,
      snapshot: this.getSnapshot(),
    });
  }

  public destroy() {
    this.isDestroyed = true;
    this.room.status = 'CLOSED';
    if (this.callerInterval) clearInterval(this.callerInterval);
    if (this.unsubscribeTransport) {
      this.unsubscribeTransport();
      this.unsubscribeTransport = null;
    }
  }
}
