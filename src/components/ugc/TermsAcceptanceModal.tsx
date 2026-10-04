import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WarningIcon, CheckIcon } from '../icons/CustomIcons';

interface TermsAcceptanceModalProps {
  visible: boolean;
  onAcceptTerms: () => void;
  onDecline: () => void;
}

/**
 * TermsAcceptanceModal
 * End User License Agreement (EULA) & Zero-Tolerance Community Rules Modal.
 * Mandatory compliance dialog required before submitting User-Generated Content.
 */
export const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({
  visible,
  onAcceptTerms,
  onDecline,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <TouchableWithoutFeedback onPress={onDecline}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: COLORS.winterHazel,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
                  ]}
                >
                  <WarningIcon size={22} color={COLORS.primaryOrange} />
                </View>
                <View style={styles.titleWrap}>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>
                    Community Rules & EULA
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Zero-Tolerance Policy for Objectionable Content
                  </Text>
                </View>
              </View>

              {/* Scrollable Terms Content */}
              <ScrollView
                style={[
                  styles.termsScroll,
                  {
                    backgroundColor: theme.bgRecessed,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                showsVerticalScrollIndicator
              >
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                  1. Zero Tolerance Policy
                </Text>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  Bingo App strictly enforces a zero-tolerance policy against objectionable, abusive, or harmful user-generated content. All posts, room names, and display names are actively monitored.
                </Text>

                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                  2. Prohibited Content
                </Text>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  You agree NOT to post, transmit, or share content containing:
                  {'\n'}• Harassment, bullying, or targeted personal attacks
                  {'\n'}• Threats of violence or promotion of physical harm
                  {'\n'}• Hate speech, slurs, or discriminatory abuse
                  {'\n'}• Explicit sexual content, pornography, or solicitation
                  {'\n'}• Any material involving or referencing minors
                  {'\n'}• Encouragement of self-harm or suicide
                  {'\n'}• Doxxing, sharing private contact details or PII
                  {'\n'}• Spam, scams, phishing, or malicious links
                  {'\n'}• Promotion of illegal activities or contraband
                </Text>

                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                  3. Enforcement & Penalties
                </Text>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  Violations of these community rules will result in immediate content removal, in-app account suspension, and potential permanent ejection from the platform. Reports are reviewed by human moderators within 24 hours.
                </Text>

                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                  4. Contact Information & Support
                </Text>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  To manually report inappropriate activity, appeal a suspension, or if you have any safety concerns, please contact our moderation team directly at support@bingoapp.com.
                </Text>
              </ScrollView>

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: theme.borderSubtle }]}
                  onPress={onDecline}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Decline Terms"
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textPrimary }]}>
                    Decline
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.acceptBtn,
                    {
                      backgroundColor: COLORS.gentleOlive,
                      borderColor: '#B8C665',
                    },
                  ]}
                  onPress={onAcceptTerms}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Agree and Accept Zero Tolerance Policy"
                >
                  <Text style={[styles.acceptBtnText, { color: COLORS.lunarShadow }]}>
                    Agree & Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '82%',
    borderRadius: RADIUS.surface,
    borderWidth: 1.5,
    padding: SPACING.lg,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  termsScroll: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    maxHeight: 240,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: SPACING.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  acceptBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
