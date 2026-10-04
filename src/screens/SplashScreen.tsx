import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      onFinish();
    });
  }, [onFinish, progress]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Animated App Logo Grid (3x3 matching storyboard splash) */}
        <View style={styles.gridBox}>
          {['B', 'I', 'N', 'G', 'O', '7', '18', '42', '99'].map((val, index) => (
            <View key={index} style={styles.gridTile}>
              <Text style={styles.tileText}>{val}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.appTitle}>App Logo</Text>
      </View>

      <View style={styles.loadingContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: widthInterpolate }]} />
        </View>
        <Text style={styles.loadingText}>Loading Bar...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A', // Deep Android Indigo-Blue
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  gridBox: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.hero,
    padding: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gridTile: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.surface,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  tileText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  appTitle: {
    marginTop: SPACING.md,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  loadingContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
  },
  track: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bar: {
    height: '100%',
    backgroundColor: '#F59E0B', // Vibrant Gold
    borderRadius: RADIUS.pill,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#E0E7FF',
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});
