/**
 * Moderation & UGC Safety Engine
 * Apple Guideline 1.2 & Google Play UGC Policy Compliance
 * Production-grade pre-publication filtering, 24-hour SLA report queue,
 * user blocking, age verification, terms consent, and ban enforcement.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import {
  UgcReport,
  ReportCategory,
  ReportStatus,
  UserBlock,
  UserModerationState,
  EnforcementLevel,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  PostStatus,
} from '../types';

const STORAGE_KEYS = {
  MODERATION_STATE: 'bingo_user_mod_state_',
  BLOCKS: 'bingo_user_blocks_',
  REPORTS: 'bingo_ugc_reports',
  HIDDEN_POSTS: 'bingo_hidden_posts_',
};

// SLA Duration: 24 Hours in Milliseconds
export const MODERATION_SLA_MS = 24 * 60 * 60 * 1000;

/**
 * Text Normalization for obfuscation detection
 */
export function normalizeText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[@@]/g, 'a')
    .replace(/[\$S\$]/gi, 's')
    .replace(/[1!i\|]/gi, 'i')
    .replace(/[0o]/gi, 'o')
    .replace(/[3e]/gi, 'e')
    .replace(/[4a]/gi, 'a')
    .replace(/[5s]/gi, 's')
    .replace(/[7t]/gi, 't')
    .replace(/[\s\.\-_\*\+]+/g, ''); // strip spacing & obfuscation punctuation
}

/**
 * Objectionable Content Filter Patterns
 */
const OBJECTIONABLE_PATTERNS: Array<{
  category: ReportCategory;
  pattern: RegExp;
  reason: string;
}> = [
  // Minor Safety & Exploitation
  {
    category: 'MINOR_SAFETY',
    pattern: /(pedophil|childporn|cp|underage|minorsex|loli|childsex)/i,
    reason: 'Content involving or referencing exploitation of minors is strictly prohibited.',
  },
  // Sexual Content & Solicitation
  {
    category: 'SEXUAL_CONTENT',
    pattern: /(porn|nude|naked|sexTape|onlyfans|horny|blowjob|cunt|dickpic|pussy|fuck|escort|hookup)/i,
    reason: 'Explicit sexual content or solicitation is prohibited.',
  },
  // Threat & Violence
  {
    category: 'THREAT',
    pattern: /(kill\s*(you|yourself|them)|i\s*will\s*shoot|bomb|murder\s*you|stab|deathtreat|die\s*bitch)/i,
    reason: 'Violent threats and promotion of violence are prohibited.',
  },
  // Hate Speech & Discrimination
  {
    category: 'HATE_SPEECH',
    pattern: /(nigger|nigga|faggot|kike|chink|spic|retard|transphobic|homophobic|racist|white\s*supremac)/i,
    reason: 'Hate speech, slurs, and discriminatory abuse are prohibited.',
  },
  // Harassment & Bullying
  {
    category: 'HARASSMENT',
    pattern: /(ugly\s*bitch|fat\s*pig|slut|whore|worthless\s*trash|kys|go\s*die)/i,
    reason: 'Targeted harassment or bullying is prohibited.',
  },
  // Self-Harm
  {
    category: 'SELF_HARM',
    pattern: /(suicide|cut\s*myself|end\s*my\s*life|kill\s*myself|hang\s*myself)/i,
    reason: 'Encouragement or detailed reference to self-harm is prohibited.',
  },
  // Doxxing / PII
  {
    category: 'DOXXING',
    pattern: /(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{3}[-.]?\d{2}[-.]?\d{4}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    reason: 'Posting personal contact information or private details is prohibited.',
  },
  // Spam & Scams
  {
    category: 'SPAM',
    pattern: /(free\s*gems\s*click|crypto\s*airdrop|whatsapp\s*\+\d+|telegram\s*t\.me|bit\.ly\/|tinyurl)/i,
    reason: 'Spam, scams, or unauthorized promotion links are prohibited.',
  },
];

export interface ContentFilterResult {
  isObjectionable: boolean;
  category?: ReportCategory;
  reason?: string;
  cleanedContent: string;
}

export class ModerationService {
  /**
   * Screen text content before publication
   */
  public filterContent(content: string): ContentFilterResult {
    const rawTrimmed = (content || '').trim();
    if (!rawTrimmed) {
      return { isObjectionable: false, cleanedContent: '' };
    }

    const normalized = normalizeText(rawTrimmed);

    for (const item of OBJECTIONABLE_PATTERNS) {
      if (item.pattern.test(rawTrimmed) || item.pattern.test(normalized)) {
        return {
          isObjectionable: true,
          category: item.category,
          reason: item.reason,
          cleanedContent: rawTrimmed,
        };
      }
    }

    return {
      isObjectionable: false,
      cleanedContent: rawTrimmed,
    };
  }

  /**
   * Load or initialize user moderation state (Age verification, Terms consent, Ban level)
   */
  public async getModerationState(userId: string): Promise<UserModerationState> {
    try {
      // 1. Try Supabase
      const { data, error } = await supabase
        .from('user_moderation_states')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        return {
          userId: data.user_id,
          enforcementLevel: (data.enforcement_level || 0) as EnforcementLevel,
          isBanned: !!data.is_banned,
          banExpiresAt: data.ban_expires_at ? new Date(data.ban_expires_at).getTime() : undefined,
          ageVerified: !!data.age_verified,
          ageVerifiedAt: data.age_verified_at ? new Date(data.age_verified_at).getTime() : undefined,
          termsAccepted: !!data.terms_accepted,
          termsAcceptedAt: data.terms_accepted_at ? new Date(data.terms_accepted_at).getTime() : undefined,
          termsVersion: data.terms_version || 'v1.0',
          warningCount: data.warning_count || 0,
        };
      }
    } catch {
      // Fallback to local storage
    }

    // Local Storage fallback
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.MODERATION_STATE}${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    // Default unverified state
    return {
      userId,
      enforcementLevel: 0,
      isBanned: false,
      ageVerified: false,
      termsAccepted: false,
      termsVersion: 'v1.0',
      warningCount: 0,
    };
  }

  /**
   * Record Age Verification (18+ Adult Gate)
   */
  public async setAgeVerified(userId: string, isAdult: boolean): Promise<UserModerationState> {
    const currentState = await this.getModerationState(userId);
    const updatedState: UserModerationState = {
      ...currentState,
      ageVerified: isAdult,
      ageVerifiedAt: isAdult ? Date.now() : undefined,
    };

    await this.saveModerationState(updatedState);
    return updatedState;
  }

  /**
   * Record EULA & Terms Consent
   */
  public async setTermsAccepted(userId: string, accepted: boolean, version: string = 'v1.0'): Promise<UserModerationState> {
    const currentState = await this.getModerationState(userId);
    const updatedState: UserModerationState = {
      ...currentState,
      termsAccepted: accepted,
      termsAcceptedAt: accepted ? Date.now() : undefined,
      termsVersion: version,
    };

    await this.saveModerationState(updatedState);
    return updatedState;
  }

  private async saveModerationState(state: UserModerationState): Promise<void> {
    // 1. Local Storage
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.MODERATION_STATE}${state.userId}`,
        JSON.stringify(state)
      );
    } catch {}

    // 2. Supabase Sync
    try {
      await supabase.from('user_moderation_states').upsert({
        user_id: state.userId,
        enforcement_level: state.enforcementLevel,
        is_banned: state.isBanned,
        ban_expires_at: state.banExpiresAt ? new Date(state.banExpiresAt).toISOString() : null,
        age_verified: state.ageVerified,
        age_verified_at: state.ageVerifiedAt ? new Date(state.ageVerifiedAt).toISOString() : null,
        terms_accepted: state.termsAccepted,
        terms_accepted_at: state.termsAcceptedAt ? new Date(state.termsAcceptedAt).toISOString() : null,
        terms_version: state.termsVersion || 'v1.0',
        warning_count: state.warningCount || 0,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  /**
   * Verify if user is eligible to submit UGC
   */
  public async isUserAllowedToPost(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    requiresAgeGate?: boolean;
    requiresTerms?: boolean;
  }> {
    const state = await this.getModerationState(userId);

    if (state.isBanned) {
      if (state.banExpiresAt && state.banExpiresAt > Date.now()) {
        const remainingHours = Math.ceil((state.banExpiresAt - Date.now()) / (1000 * 60 * 60));
        return {
          allowed: false,
          reason: `Your account is suspended due to safety policy violations. Time remaining: ${remainingHours}h.`,
        };
      } else if (state.banExpiresAt && state.banExpiresAt <= Date.now()) {
        // Expired temporary ban -> lift ban
        state.isBanned = false;
        state.banExpiresAt = undefined;
        await this.saveModerationState(state);
      } else {
        return {
          allowed: false,
          reason: 'Your account has been permanently suspended due to severe policy violations.',
        };
      }
    }

    if (!state.ageVerified) {
      return {
        allowed: false,
        reason: 'Age verification (18+) is required before creating user-generated content.',
        requiresAgeGate: true,
      };
    }

    if (!state.termsAccepted) {
      return {
        allowed: false,
        reason: 'Acceptance of Community Terms & EULA is required before posting.',
        requiresTerms: true,
      };
    }

    return { allowed: true };
  }

  /**
   * Submit UGC Report with 24-Hour SLA Tracking
   */
  public async submitReport(payload: {
    postId: string;
    reportedUserId: string;
    reporterId: string;
    category: ReportCategory;
    description?: string;
    contentSnapshot?: string;
  }): Promise<{ success: boolean; report: UgcReport; message: string }> {
    const now = Date.now();
    const slaDeadline = now + MODERATION_SLA_MS;

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    if (payload.category === 'MINOR_SAFETY' || payload.category === 'THREAT' || payload.category === 'SELF_HARM') {
      priority = 'URGENT';
    } else if (payload.category === 'SEXUAL_CONTENT' || payload.category === 'DOXXING' || payload.category === 'HATE_SPEECH') {
      priority = 'HIGH';
    }

    const report: UgcReport = {
      id: `rep-${Math.floor(Math.random() * 900000 + 100000)}`,
      postId: payload.postId,
      reportedUserId: payload.reportedUserId,
      reporterId: payload.reporterId,
      category: payload.category,
      description: payload.description,
      createdAt: now,
      slaDeadline,
      priority,
      status: 'OPEN',
      contentSnapshot: payload.contentSnapshot,
    };

    // Save locally
    const reports = await this.getAllReportsLocal();
    // Prevent excessive duplicate reports from same reporter for same post
    const existing = reports.find((r) => r.reporterId === payload.reporterId && r.postId === payload.postId);
    if (existing) {
      return {
        success: true,
        report: existing,
        message: 'You have already reported this content. Our moderation team is reviewing it within our 24-hour SLA.',
      };
    }

    reports.push(report);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Save to Supabase
    try {
      await supabase.from('ugc_reports').insert({
        id: report.id,
        post_id: report.postId,
        reported_user_id: report.reportedUserId,
        reporter_id: report.reporterId,
        category: report.category,
        description: report.description,
        priority: report.priority,
        status: report.status,
        sla_deadline: new Date(report.slaDeadline).toISOString(),
        content_snapshot: report.contentSnapshot,
        created_at: new Date(report.createdAt).toISOString(),
      });
    } catch {}

    // Quarantine post if urgent/high priority
    if (priority === 'URGENT' || priority === 'HIGH') {
      await this.quarantinePostLocal(payload.postId);
    }

    return {
      success: true,
      report,
      message: 'Thank you for reporting. Our moderation team will investigate within 24 hours.',
    };
  }

  private async getAllReportsLocal(): Promise<UgcReport[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async quarantinePostLocal(postId: string): Promise<void> {
    try {
      await supabase.from('ugc_posts').update({ status: 'QUARANTINED' }).eq('id', postId);
    } catch {}
  }

  /**
   * Fetch active reports for moderation queue with SLA calculations
   */
  public async getModerationQueue(): Promise<UgcReport[]> {
    let reports: UgcReport[] = [];

    try {
      const { data, error } = await supabase
        .from('ugc_reports')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && !error && data.length > 0) {
        reports = data.map((d: any) => ({
          id: d.id,
          postId: d.post_id,
          reportedUserId: d.reported_user_id,
          reporterId: d.reporter_id,
          category: d.category as ReportCategory,
          description: d.description,
          createdAt: new Date(d.created_at).getTime(),
          slaDeadline: new Date(d.sla_deadline).getTime(),
          priority: d.priority || 'MEDIUM',
          status: d.status as ReportStatus,
          moderatorId: d.moderator_id,
          resolvedAt: d.resolved_at ? new Date(d.resolved_at).getTime() : undefined,
          resolution: d.resolution,
          enforcementAction: d.enforcement_action,
          contentSnapshot: d.content_snapshot,
        }));
      }
    } catch {}

    if (reports.length === 0) {
      reports = await this.getAllReportsLocal();
    }

    // Sort by priority and SLA deadline (Overdue first)
    return reports.sort((a, b) => {
      const aOverdue = Date.now() > a.slaDeadline;
      const bOverdue = Date.now() > b.slaDeadline;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return a.slaDeadline - b.slaDeadline;
    });
  }

  /**
   * Resolve Report & Apply Enforcement
   */
  public async resolveReport(
    reportId: string,
    moderatorId: string,
    resolution: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'EJECT_USER' | 'DISMISS',
    notes?: string
  ): Promise<void> {
    const now = Date.now();
    const reports = await this.getAllReportsLocal();
    const reportIndex = reports.findIndex((r) => r.id === reportId);
    let targetReport = reportIndex >= 0 ? reports[reportIndex] : null;

    if (targetReport) {
      targetReport.status = resolution === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
      targetReport.moderatorId = moderatorId;
      targetReport.resolvedAt = now;
      targetReport.resolution = notes || `Report resolved with action: ${resolution}`;
      targetReport.enforcementAction = resolution;

      reports[reportIndex] = targetReport;
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }

    // Sync to Supabase
    try {
      await supabase.from('ugc_reports').update({
        status: resolution === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
        moderator_id: moderatorId,
        resolved_at: new Date(now).toISOString(),
        resolution: notes || `Report resolved with action: ${resolution}`,
        enforcement_action: resolution,
      }).eq('id', reportId);
    } catch {}

    if (!targetReport) return;

    // Apply Content Removal
    if (resolution === 'REMOVE_CONTENT' || resolution === 'SUSPEND_USER' || resolution === 'EJECT_USER') {
      try {
        await supabase.from('ugc_posts').update({
          status: 'REMOVED',
          removal_reason: `Moderator action: ${resolution}`,
          updated_at: new Date(now).toISOString(),
        }).eq('id', targetReport.postId);
      } catch {}
    }

    // Apply User Suspension or Ejection
    if (resolution === 'SUSPEND_USER') {
      await this.suspendOrBanUser(
        targetReport.reportedUserId,
        2,
        24 * 60 * 60 * 1000, // 24 hours temporary suspension
        'Temporary suspension due to content violation.'
      );
    } else if (resolution === 'EJECT_USER') {
      await this.suspendOrBanUser(
        targetReport.reportedUserId,
        3,
        undefined, // Permanent ejection
        'Permanent account ejection due to severe safety policy violation.'
      );
    }
  }

  /**
   * Block Abusive User directly from UGC
   */
  public async blockUser(blockerUserId: string, blockedUserId: string): Promise<UserBlock> {
    const block: UserBlock = {
      id: `blk-${Math.floor(Math.random() * 90000 + 10000)}`,
      blockerUserId,
      blockedUserId,
      createdAt: Date.now(),
    };

    // Save locally
    const currentBlocks = await this.getBlockedUserIds(blockerUserId);
    if (!currentBlocks.includes(blockedUserId)) {
      const updated = [...currentBlocks, blockedUserId];
      await AsyncStorage.setItem(`${STORAGE_KEYS.BLOCKS}${blockerUserId}`, JSON.stringify(updated));
    }

    // Save to Supabase
    try {
      await supabase.from('user_blocks').insert({
        id: block.id,
        blocker_user_id: blockerUserId,
        blocked_user_id: blockedUserId,
        created_at: new Date(block.createdAt).toISOString(),
      });
    } catch {}

    return block;
  }

  /**
   * Get list of blocked user IDs for a blocker
   */
  public async getBlockedUserIds(blockerUserId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocked_user_id')
        .eq('blocker_user_id', blockerUserId);

      if (data && !error) {
        return data.map((d: any) => d.blocked_user_id);
      }
    } catch {}

    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.BLOCKS}${blockerUserId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Suspend or Ban User
   */
  public async suspendOrBanUser(
    userId: string,
    level: EnforcementLevel,
    durationMs?: number,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    reason?: string
  ): Promise<UserModerationState> {
    const state = await this.getModerationState(userId);
    const updated: UserModerationState = {
      ...state,
      enforcementLevel: level,
      isBanned: level >= 2,
      banExpiresAt: durationMs ? Date.now() + durationMs : undefined,
      warningCount: state.warningCount + 1,
    };

    await this.saveModerationState(updated);
    return updated;
  }
}

export const globalModerationService = new ModerationService();
