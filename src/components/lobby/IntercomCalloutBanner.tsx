import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BingoIdentityIcon, ChevronIcon } from '../icons/CustomIcons';

interface IntercomCalloutBannerProps {
  title?: string;
  subtitle?: string;
  onlineCount?: number | null;
  onPress: () => void;
}

/**
 * Intercom Callout Banner
 * Directly extracted from Reference Image 1 apex callout:
 * - Lunar Shadow (#282828) pill container
 * - Diagonal hatch / striped tactile texture
 * - Left circular badge in Gentle Olive (#CBD77E)
 * - Right circular action button in Clean White (#FFFFFF) with diagonal arrow ↗
 */
export const IntercomCalloutBanner: React.FC<IntercomCalloutBannerProps> = ({
  title = 'Live Blitz Arena',
  subtitle = 'Instant match • 5×5 Matrix',
  onlineCount = 1240,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
    >
      {/* Diagonal Hatch Stripe Texture (Reference 1 & Reference 3) */}
      <View style={styles.hatchTextureWrap} pointerEvents="none">
        {[...Array(14)].map((_, i) => (
          <View
            key={`stripe-${i}`}
            style={[
              styles.hatchStripe,
              { left: i * 28 - 20 },
            ]}
          />
        ))}
      </View>

      {/* Left Circular Badge in Gentle Olive */}
      <View style={styles.badgeSphere}>
        <BingoIdentityIcon size={18} color={COLORS.lunarShadow} variant="filled" />
      </View>

      {/* Middle Text Hierarchy */}
      <View style={styles.textGroup}>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.livePulse} />
          <Text style={styles.metaText}>
            {onlineCount ? `${onlineCount.toLocaleString()} Playing` : subtitle}
          </Text>
        </View>
      </View>

      {/* Right Circular White Button with Diagonal Arrow ↗ */}
      <View style={styles.arrowButton}>
        <Text style={styles.diagonalArrow}>↗</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: COLORS.lunarShadow, // #282828
    borderRadius: RADIUS.dock, // 28px pill capsule
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm, // 8px
    paddingVertical: 6,
    marginVertical: SPACING.sm, // 8px
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#383838',
  },
  hatchTextureWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  hatchStripe: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    transform: [{ rotate: '45deg' }],
  },
  badgeSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gentleOlive, // #CBD77E
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    paddingHorizontal: SPACING.md, // 12px
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.cleanWhite, // #FFFFFF
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gentleOlive,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0A5AD',
    letterSpacing: 0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.cleanWhite, // #FFFFFF
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  diagonalArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.lunarShadow, // #282828
    marginTop: -2,
    marginLeft: 1,
  },
});
