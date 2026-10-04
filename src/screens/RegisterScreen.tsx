import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
import { useTheme } from '../design/theme';
import { GameButton } from '../components/common/GameButton';
import { GameInput } from '../components/common/GameInput';
import { PasswordField } from '../components/auth/PasswordField';
import { ProfileIcon as UserIcon } from '../components/icons/CustomIcons';

interface RegisterScreenProps {
  onNavigateSignIn: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateSignIn,
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(undefined);
    setPasswordError(undefined);
    setServerError(undefined);
    setSuccessMessage(undefined);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Enter your email.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Enter your password.');
      isValid = false;
    }

    return isValid;
  };

  async function signUpWithEmail() {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setServerError(undefined);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });
    setLoading(false);

    if (error) {
      setServerError('Something went wrong. Please try again.');
    } else if (data?.user) {
      setSuccessMessage('Please check your email for the login confirmation link!');
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join Bingo Adventure today
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Server error banner */}
        {serverError ? (
          <View style={[styles.messageBanner, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: COLORS.dangerRed }]}>
            <Text style={[styles.messageText, { color: COLORS.dangerRed }]}>{serverError}</Text>
          </View>
        ) : null}

        {/* Success message banner */}
        {successMessage ? (
          <View style={[styles.messageBanner, { backgroundColor: theme.accentOliveTint, borderColor: COLORS.gentleOlive }]}>
            <Text style={[styles.messageText, { color: COLORS.lunarShadow }]}>{successMessage}</Text>
          </View>
        ) : null}

        <GameInput
          label="EMAIL ADDRESS"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(undefined);
            if (serverError) setServerError(undefined);
          }}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
          icon={<UserIcon size={18} color={theme.textMuted} />}
        />
        
        <View style={{ height: 12 }} />

        <PasswordField
          label="PASSWORD"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(undefined);
            if (serverError) setServerError(undefined);
          }}
          placeholder="Create a password"
          error={passwordError}
          disabled={loading}
        />

        <View style={{ marginTop: SPACING.lg }}>
          <GameButton
            title={loading ? 'Creating Account…' : 'Sign Up'}
            onPress={signUpWithEmail}
            variant="primary"
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
          onPress={onNavigateSignIn}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Go to Sign In"
        >
          <Text style={[styles.guestLinkText, { color: theme.textSecondary }]}>
            Already have an account? Sign In
          </Text>
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
  guestLink: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: TYPOGRAPHY.fontFamily,
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
});
