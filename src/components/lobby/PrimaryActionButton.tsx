import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RankedLightningIcon } from '../icons/CustomIcons';

interface PrimaryActionButtonProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  badge?: string;
}

/**
 * Primary Action Button
 * Directly maps the vibrant high-contrast action from Reference Images 1 & 3:
 * - Gentle Olive (#CBD77E) substrate
 * - Lunar Shadow (#282828) deep typography
 * - Clean White (#FFFFFF) circular badge with diagonal arrow ↗
 * - Generous 24px-28px corner radius
 */
export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onPress,
  title = 'PLAY RANKED MATCH',
  subtitle = '5×5 Matrix • ±25 MMR • Live Queue',
  badge = 'ACTIVE SEASON',
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.contentRow}>
        <View style={styles.textGroup}>
          <View style={styles.badgeRow}>
            <View style={styles.liveIndicator} />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>

        <View style={styles.actionIconSphere}>
          <Text style={styles.arrowIcon}>↗</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gentleOlive, // #CBD77E (Reference 3 Accent 1)
    borderRadius: RADIUS.sheet, // 28px
    paddingVertical: SPACING.md, // 12px
    paddingHorizontal: SPACING.xl, // 20px
    width: '100%',
    shadowColor: COLORS.gentleOlive,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#D7E28E',
    marginVertical: SPACING.xs, // 4px
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lunarShadow,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.lunarShadow,
    letterSpacing: 0.8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.lunarShadow,
    letterSpacing: -0.3,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#434A1B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  actionIconSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cleanWhite, // #FFFFFF
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.lunarShadow,
    marginTop: -2,
    marginLeft: 1,
  },
});
