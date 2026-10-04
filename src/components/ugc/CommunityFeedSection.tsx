import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { UgcPost, Player } from '../../domain/types';
import { globalUgcPostService } from '../../domain/services/ugcPostService';
import { globalModerationService } from '../../domain/services/moderationService';
import { CommunityFeedCard } from './CommunityFeedCard';
import { ReportModal } from './ReportModal';
import { AgeGateModal } from './AgeGateModal';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { CheckIcon, WarningIcon, UsersIcon } from '../icons/CustomIcons';

interface CommunityFeedSectionProps {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  player: Player;
}

/**
 * CommunityFeedSection
 * Production-Grade User Generated Content Community Board.
 * Features post composer, pre-publication filtering, age verification,
 * EULA consent gates, reporting, user blocking, and local post hiding.
 */
export const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({ player }) => {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme } = useTheme();

  const [posts, setPosts] = useState<UgcPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modals state
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [reportingPost, setReportingPost] = useState<UgcPost | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadFeed = useCallback(async () => {
    try {
      const feedPosts = await globalUgcPostService.getFeedPosts(player.id);
      setPosts(feedPosts);
    } catch {
      showToast('Could not load community posts.', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [player.id]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleCreatePostAttempt = async () => {
    const trimmed = newPostText.trim();
    if (!trimmed) {
      showToast('Please enter text to post.', true);
      return;
    }

    // Check Eligibility (Age Gate, Terms, Ban)
    const allowedCheck = await globalModerationService.isUserAllowedToPost(player.id);
    if (!allowedCheck.allowed) {
      if (allowedCheck.requiresAgeGate) {
        setShowAgeGate(true);
        return;
      }
      if (allowedCheck.requiresTerms) {
        setShowTermsModal(true);
        return;
      }
      showToast(allowedCheck.reason || 'Not allowed to post.', true);
      return;
    }

    // Submit Post
    setIsPosting(true);
    try {
      const res = await globalUgcPostService.createPost(
        player.id,
        player.name || 'Anonymous Player',
        trimmed
      );

      if (!res.success) {
        showToast(res.error || 'Post rejected by safety filter.', true);
      } else {
        setNewPostText('');
        showToast('Post published to community board!');
        loadFeed();
      }
    } catch {
      showToast('Error publishing post. Please try again.', true);
    } finally {
      setIsPosting(false);
    }
  };

  const handleConfirmAge = async () => {
    await globalModerationService.setAgeVerified(player.id, true);
    setShowAgeGate(false);

    // Prompt for Terms next
    const modState = await globalModerationService.getModerationState(player.id);
    if (!modState.termsAccepted) {
      setShowTermsModal(true);
    } else {
      showToast('Age verified! You can now share community posts.');
    }
  };

  const handleAcceptTerms = async () => {
    await globalModerationService.setTermsAccepted(player.id, true, 'v1.0');
    setShowTermsModal(false);
    showToast('Community EULA accepted! You can now create posts.');
  };

  const handleBlockUser = async (blockedUserId: string, authorName: string) => {
    await globalModerationService.blockUser(player.id, blockedUserId);
    showToast(`Blocked ${authorName}. Content hidden from feed.`);
    loadFeed();
  };

  const handleHidePost = async (postId: string) => {
    await globalUgcPostService.hidePostForUser(player.id, postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post hidden from your feed.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }]}>
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <View
          style={[
            styles.toastBanner,
            {
              backgroundColor: toastMessage.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(184, 198, 101, 0.2)',
              borderColor: toastMessage.isError ? COLORS.dangerRed : COLORS.gentleOlive,
            },
          ]}
        >
          {toastMessage.isError ? (
            <WarningIcon size={14} color={COLORS.dangerRed} />
          ) : (
            <CheckIcon size={14} color={COLORS.lunarShadow} />
          )}
          <Text
            style={[
              styles.toastText,
              { color: toastMessage.isError ? COLORS.dangerRed : theme.textPrimary },
            ]}
          >
            {toastMessage.text}
          </Text>
        </View>
      )}

      {/* Header Title */}
      <View style={styles.headerRow}>
        <UsersIcon size={18} color={COLORS.primaryOrange} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Community Board
        </Text>
      </View>

      {/* Post Composer */}
      <View style={[styles.composerBox, { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle }]}>
        <TextInput
          style={[styles.composerInput, { color: theme.textPrimary }]}
          placeholder="Share a message or challenge with players..."
          placeholderTextColor={theme.textMuted}
          value={newPostText}
          onChangeText={setNewPostText}
          multiline
          maxLength={200}
        />

        <View style={styles.composerFooter}>
          <Text style={[styles.charCount, { color: theme.textMuted }]}>
            {200 - newPostText.length} left
          </Text>

          <TouchableOpacity
            style={[
              styles.postBtn,
              {
                backgroundColor: COLORS.gentleOlive,
                borderColor: '#B8C665',
                opacity: isPosting ? 0.7 : 1,
              },
            ]}
            disabled={isPosting}
            onPress={handleCreatePostAttempt}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Publish post"
          >
            {isPosting ? (
              <ActivityIndicator size="small" color={COLORS.lunarShadow} />
            ) : (
              <Text style={[styles.postBtnText, { color: COLORS.lunarShadow }]}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primaryOrange} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading posts...
          </Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No posts yet. Be the first to post on the board!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.feedScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primaryOrange} />
          }
        >
          {posts.map((post) => (
            <CommunityFeedCard
              key={post.id}
              post={post}
              currentUserId={player.id}
              onReportPost={(p) => setReportingPost(p)}
              onBlockUser={handleBlockUser}
              onHidePost={handleHidePost}
            />
          ))}
        </ScrollView>
      )}

      {/* Safety Modals */}
      <AgeGateModal
        visible={showAgeGate}
        onConfirmAdult={handleConfirmAge}
        onCancel={() => setShowAgeGate(false)}
      />

      <TermsAcceptanceModal
        visible={showTermsModal}
        onAcceptTerms={handleAcceptTerms}
        onDecline={() => setShowTermsModal(false)}
      />

      {reportingPost && (
        <ReportModal
          visible={!!reportingPost}
          postId={reportingPost.id}
          reportedUserId={reportingPost.authorId}
          reporterId={player.id}
          contentSnapshot={reportingPost.content}
          onClose={() => setReportingPost(null)}
          onReportSubmitted={(msg) => showToast(msg)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.surface,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  composerBox: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  composerInput: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  charCount: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  postBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.control,
    borderWidth: 1,
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  loadingBox: {
    padding: SPACING.lg,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  emptyBox: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  feedScroll: {
    maxHeight: 320,
  },
});
