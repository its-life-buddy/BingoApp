import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
import { useTheme } from '../design/theme';
import { GameButton } from '../components/common/GameButton';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GOOGLE_CLIENT_ID, IOS_CLIENT_ID } from '@env';

interface SignInScreenProps {
  currentName: string;
  onLogin: (name: string, userId?: string) => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onLogin,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Note: You must configure the Web Client ID from Google Cloud Console here
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
    });
  }, []);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      let user = null;

      if (Platform.OS === 'web') {
        // Use Supabase's native web OAuth for the browser
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        // Supabase will handle the redirect automatically
        return;
      }

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === 'success' && response.data.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.data.idToken,
        });

        if (error) throw error;
        user = data.user;
      }

      if (user) {
        // Fetch the user's custom name from the profiles table, in case they edited it!
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        const finalName = profile?.name || user.user_metadata?.full_name || 'Player';
        onLogin(finalName, user.id);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    try {
      setLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      if (credentialState === appleAuth.State.AUTHORIZED) {
        const { identityToken } = appleAuthRequestResponse;
        if (identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: identityToken,
            nonce: appleAuthRequestResponse.nonce,
          });

          if (error) throw error;
          if (data.user) {
            const name = data.user.user_metadata?.full_name || 'Player';
            onLogin(name, data.user.id);
          }
        }
      }
    } catch (error: any) {
      if (error.code !== appleAuth.Error.CANCELED) {
        console.error('Apple Sign-In Error:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestSubmit() {
    if (loading) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signInAnonymously();
    setLoading(false);

    if (error) {
      console.log('Anonymous sign-in not enabled, falling back to local guest session.');
      const localGuestId = `guest-${Math.random().toString(36).substring(2, 10)}`;
      onLogin('Guest Player', localGuestId);
    } else if (data?.user) {
      onLogin('Guest Player', data.user.id);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      {/* Brand Identity & Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/app_icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Bingo Adventure Compass Icon"
          />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Bingo Adventure</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to save your streaks, XP, and stats
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={{ gap: SPACING.md }}>
          {Platform.OS === 'ios' && appleAuth.isSupported && (
            <GameButton
              title={loading ? 'Please wait...' : 'Sign in with Apple'}
              onPress={handleAppleSignIn}
              variant="secondary"
              size="lg"
              fullWidth
              disabled={loading}
            />
          )}
          <GameButton
            title={loading ? 'Please wait...' : 'Sign in with Google'}
            onPress={handleGoogleSignIn}
            variant="secondary"
            size="lg"
            fullWidth
            disabled={loading}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
        </View>

        <TouchableOpacity
          style={styles.guestLink}
          onPress={handleGuestSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Quick guest play"
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.textPrimary} />
          ) : (
            <Text style={[styles.guestLinkText, { color: theme.textSecondary }]}>
              Continue as Anonymous Guest • Instant Play
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoWrap: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
  },
  actionBtn: {
    marginTop: SPACING.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    marginHorizontal: SPACING.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  socialBrandBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  guestLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.xs,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  eyeBtn: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  messageText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
  },
  qaContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  qaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  qaHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  qaSubtitle: {
    fontSize: 11,
    marginBottom: SPACING.sm,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  qaButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qaBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaBtnText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

