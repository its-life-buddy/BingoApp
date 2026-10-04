import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
import { useTheme } from '../design/theme';
import { GameButton } from '../components/common/GameButton';

interface DeleteAccountScreenProps {
  onCancel: () => void;
  onAccountDeleted: () => void;
}

export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  onCancel,
  onAccountDeleted,
}) => {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // Note: Requires delete_user RPC to be defined in Supabase
      const { error: rpcError } = await supabase.rpc('delete_user');
      
      if (rpcError) {
        throw rpcError;
      }
      
      // Call success callback which will handle logging out and redirecting
      onAccountDeleted();
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please try again later or contact support.");
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: COLORS.dangerRed }]}>Delete Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            This action is permanent and cannot be undone.
          </Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: COLORS.dangerRed }]}>
          <Text style={[styles.warningTitle, { color: COLORS.dangerRed }]}>What you will lose:</Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: COLORS.dangerRed }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>All your accumulated Coins and Gems</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: COLORS.dangerRed }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>Your Match History, Wins, and Win Rate</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: COLORS.dangerRed }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>Your Rating (MMR) and Rank Tier</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: COLORS.dangerRed }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>Unlocked Achievements</Text>
            </View>
          </View>
          
          <Text style={[styles.warningFooter, { color: COLORS.dangerRed }]}>
            Once deleted, your account cannot be recovered. You will need to create a new account to play again.
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: COLORS.dangerRed }]}>
            <Text style={[styles.errorText, { color: COLORS.dangerRed }]}>{error}</Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <GameButton
          title={loading ? "Deleting..." : "Permanently Delete Account"}
          onPress={handleDelete}
          variant="danger"
          size="lg"
          fullWidth
          disabled={loading}
          style={{ marginBottom: SPACING.md }}
        />
        
        <GameButton
          title="Keep My Account"
          onPress={onCancel}
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  warningBox: {
    padding: SPACING.lg,
    borderRadius: RADIUS.sheet,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: SPACING.md,
  },
  bulletList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily,
    lineHeight: 20,
    flex: 1,
  },
  warningFooter: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
    lineHeight: 18,
  },
  errorBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
});
