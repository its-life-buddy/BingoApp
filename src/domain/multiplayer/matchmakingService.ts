/**
 * Real-Time Matchmaking Service
 * Handles queuing, waiting, matching, ticket cancellation, and session handoff
 * over Supabase Realtime broadcast channels.
 * 
 * Rules:
 * 1. NEVER silently match with a bot in Random Human mode.
 * 2. Prevent self-matching (Player A cannot match with Player A).
 * 3. Atomic pairing: Deterministic leader election (e.g. min(userId) becomes match creator).
 * 4. Cancellation cleanly invalidates ticket and broadcasts leave event.
 */

import { supabase } from '../../lib/supabase';
import { Player, MatchmakingTicket, MatchmakingStatus, GameModeType } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MatchmakingCallbacks {
  onStatusChange: (status: MatchmakingStatus) => void;
  onOpponentFound: (opponent: Player, gameSessionId: string, isHost: boolean) => void;
  onCountdownTick?: (seconds: number) => void;
  onError?: (error: string) => void;
}

export class MatchmakingService {
  private static instance: MatchmakingService | null = null;
  private channel: RealtimeChannel | null = null;
  private currentTicket: MatchmakingTicket | null = null;
  private isSearching = false;
  private isProcessing = false;
  private heartbeatInterval: any = null;
  private channelName = 'bingo_matchmaking_queue';
  private matchLock = false;
  private callbacks: MatchmakingCallbacks | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => {
        if (this.isSearching) {
          this.cancelMatchmaking();
        }
      });
    }
  }

  public static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  /**
   * Request a random human match.
   * Creates an authoritative ticket and begins listening for another real player.
   */
  public async requestRandomMatch(
    player: Player,
    gameMode: GameModeType = 'RANKED',
    callbacks: MatchmakingCallbacks
  ): Promise<MatchmakingTicket | null> {
    // Rapid double-click protection
    if (this.isProcessing) {
      return this.currentTicket;
    }
    this.isProcessing = true;

    try {
      // If already searching with same user, cancel prior
      if (this.isSearching) {
        await this.cancelMatchmaking();
      }

      this.callbacks = callbacks;
      this.isSearching = true;
      this.matchLock = false;

    const ticketId = `ticket-${player.id}-${Date.now()}`;
    const now = Date.now();

    this.currentTicket = {
      ticketId,
      userId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      playerRating: player.rating,
      playerTier: player.tier,
      gameMode,
      status: 'SEARCHING',
      createdAt: now,
      expiresAt: now + 90000, // 90 seconds timeout
    };

    this.callbacks.onStatusChange('SEARCHING');

    // Subscribe to matchmaking broadcast queue channel
    this.channel = supabase.channel(this.channelName, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on('broadcast', { event: 'queue_ticket' }, (payload: any) => {
        this.handleIncomingTicket(payload.payload as MatchmakingTicket);
      })
      .on('broadcast', { event: 'match_formed' }, (payload: any) => {
        this.handleMatchFormed(payload.payload);
      })
      .on('broadcast', { event: 'ticket_cancelled' }, (payload: any) => {
        this.handleTicketCancelled(payload.payload);
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          if (this.currentTicket) {
            this.currentTicket.status = 'WAITING_FOR_PLAYER';
            this.callbacks?.onStatusChange('WAITING_FOR_PLAYER');

            // Broadcast presence ticket to queue
            this.broadcastTicket(this.currentTicket);
          }
        }
      });

    // Periodic ticket re-announcement every 3 seconds while waiting
    this.heartbeatInterval = setInterval(() => {
      if (this.currentTicket && this.isSearching && !this.matchLock) {
        if (this.currentTicket.expiresAt && Date.now() > this.currentTicket.expiresAt) {
          this.callbacks?.onStatusChange('EXPIRED');
          this.cancelMatchmaking();
          return;
        }
        this.broadcastTicket(this.currentTicket);
      }
    }, 3000);

    return this.currentTicket;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Broadcast current user's ticket to the queue
   */
  private broadcastTicket(ticket: MatchmakingTicket) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'queue_ticket',
        payload: ticket,
      }).catch((err: any) => console.warn('Matchmaking broadcast error:', err));
    }
  }

  /**
   * Handle incoming tickets from other players searching in the queue
   */
  private handleIncomingTicket(incoming: MatchmakingTicket) {
    if (!this.currentTicket || !this.isSearching || this.matchLock) return;

    // Reject self-match
    if (incoming.userId === this.currentTicket.userId) return;

    // Check expiration
    if (incoming.expiresAt && Date.now() > incoming.expiresAt) return;

    // Deterministic leader election: Player with lexically smaller userId acts as Host/Room Creator
    const isHost = this.currentTicket.userId < incoming.userId;

    if (isHost) {
      this.matchLock = true;
      const gameSessionId = `match-${this.currentTicket.userId.slice(0, 4)}-${incoming.userId.slice(0, 4)}-${Date.now().toString(36)}`;

      const opponent: Player = {
        id: incoming.userId,
        name: incoming.playerName,
        avatar: incoming.playerAvatar || incoming.playerName.slice(0, 2).toUpperCase(),
        isHost: false,
        isReady: true,
        score: 0,
        linesCompleted: 0,
        hasWon: false,
        rating: incoming.playerRating,
        tier: incoming.playerTier || 'Gold',
        coins: 1000,
        gems: 50,
      };

      const matchAnnouncement = {
        gameSessionId,
        hostId: this.currentTicket.userId,
        hostPlayer: {
          id: this.currentTicket.userId,
          name: this.currentTicket.playerName,
          avatar: this.currentTicket.playerAvatar,
          rating: this.currentTicket.playerRating,
          tier: this.currentTicket.playerTier,
        },
        guestId: incoming.userId,
        guestPlayer: {
          id: incoming.userId,
          name: incoming.playerName,
          avatar: incoming.playerAvatar,
          rating: incoming.playerRating,
          tier: incoming.playerTier,
        },
        createdAt: Date.now(),
      };

      // Broadcast match formation to both players
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'match_formed',
          payload: matchAnnouncement,
        }).catch((err: any) => console.warn('Match formed broadcast error:', err));
      }

      // Execute local match found callback for host
      this.currentTicket.status = 'MATCH_FOUND';
      this.callbacks?.onStatusChange('MATCH_FOUND');
      this.callbacks?.onOpponentFound(opponent, gameSessionId, true);
    }
  }

  /**
   * Handle match_formed broadcast from another host player
   */
  private handleMatchFormed(payload: any) {
    if (!this.currentTicket || !this.isSearching || this.matchLock) return;

    const { gameSessionId, hostId, hostPlayer, guestId } = payload;

    // Only respond if this client is the designated guest
    if (guestId === this.currentTicket.userId) {
      this.matchLock = true;

      const opponent: Player = {
        id: hostId,
        name: hostPlayer.name,
        avatar: hostPlayer.avatar,
        isHost: true,
        isReady: true,
        score: 0,
        linesCompleted: 0,
        hasWon: false,
        rating: hostPlayer.rating,
        tier: hostPlayer.tier,
        coins: 1000,
        gems: 50,
      };

      this.currentTicket.status = 'MATCH_FOUND';
      this.callbacks?.onStatusChange('MATCH_FOUND');
      this.callbacks?.onOpponentFound(opponent, gameSessionId, false);
    }
  }

  /**
   * Handle ticket cancellation from other players
   */
  private handleTicketCancelled(payload: any) {
    // Other player left queue, no action needed for current player
  }

  /**
   * Cancel ongoing matchmaking search cleanly
   */
  public async cancelMatchmaking(): Promise<void> {
    if (!this.isSearching && !this.currentTicket) return;

    if (this.currentTicket && this.channel) {
      try {
        await this.channel.send({
          type: 'broadcast',
          event: 'ticket_cancelled',
          payload: { ticketId: this.currentTicket.ticketId, userId: this.currentTicket.userId },
        });
      } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Safe ignore
      }
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    if (this.currentTicket) {
      this.currentTicket.status = 'CANCELLED';
    }

    this.isSearching = false;
    this.matchLock = false;
    this.callbacks?.onStatusChange('CANCELLED');
    this.callbacks = null;
    this.currentTicket = null;
  }

  public getCurrentTicket(): MatchmakingTicket | null {
    return this.currentTicket;
  }
}

export const globalMatchmakingService = MatchmakingService.getInstance();
