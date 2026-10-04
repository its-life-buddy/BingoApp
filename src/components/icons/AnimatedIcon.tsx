import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  TouchableOpacity,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Icon, IconProps } from './Icon';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IconName, IconState, IconVariant } from './types';
import { ICON_SIZES, MOTION } from '../../design/tokens';

export interface AnimatedIconProps extends Omit<IconProps, 'style'> {
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  triggerAnimation?: boolean;
}

/**
 * Check if the user environment has reduced motion enabled
 */
function isReducedMotionPreferred(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

/**
 * State-Driven Animated Icon Component
 * Implements micro-interactions according to the design specification:
 * - 120-160ms primary interaction (press/release)
 * - Semantic motion (Settings 60° rotation, Refresh 360° spin, Play forward nudge, Success pop)
 * - Stops all motion when idle
 * - Full reduced-motion accessibility support
 */
export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  name,
  size = ICON_SIZES.md,
  color,
  secondaryColor,
  strokeWidth = 2,
  variant = 'outline',
  state = 'idle',
  direction,
  interactive = false,
  onPress,
  style,
  accessibilityLabel,
  accessibilityRole = interactive ? 'button' : 'image',
  triggerAnimation,
}) => {
  const [internalState, setInternalState] = useState<IconState>(state);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  // Sync state prop with internal state
  useEffect(() => {
    setInternalState(state);
  }, [state]);

  // Handle continuous rotation for loading
  useEffect(() => {
    if (name === 'loading' && !isReducedMotionPreferred()) {
      const loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [name, rotateAnim]);

  // Semantic trigger animations (e.g. Refresh spin or Success pop on state change)
  useEffect(() => {
    if (isReducedMotionPreferred()) return;

    if (name === 'refresh' && (triggerAnimation || state === 'active')) {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    } else if (name === 'settings' && (triggerAnimation || state === 'active' || state === 'pressed')) {
      Animated.spring(rotateAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else if (name === 'success' || state === 'success') {
      scaleAnim.setValue(0.7);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start();
    } else if (name === 'play' && (state === 'active' || state === 'pressed')) {
      Animated.spring(translateAnim, {
        toValue: 2,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else if (name === 'leaderboard' && (state === 'active' || state === 'pressed')) {
      Animated.spring(translateAnim, {
        toValue: -2,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [name, state, triggerAnimation, rotateAnim, scaleAnim, translateAnim]);

  // Touch physics
  const handlePressIn = useCallback(() => {
    setInternalState('pressed');
    if (!isReducedMotionPreferred()) {
      Animated.timing(scaleAnim, {
        toValue: MOTION.scale.press, // 0.96
        duration: MOTION.duration.micro, // 120ms
        useNativeDriver: true,
      }).start();

      if (name === 'settings') {
        Animated.timing(rotateAnim, {
          toValue: 0.17, // ~60 degrees
          duration: 140,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [name, scaleAnim, rotateAnim]);

  const handlePressOut = useCallback(() => {
    setInternalState(state);
    if (!isReducedMotionPreferred()) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();

      if (name === 'settings') {
        Animated.spring(rotateAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [name, state, scaleAnim, rotateAnim]);

  // Rotations
  const rotationInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      ...(name === 'loading' || name === 'refresh' || name === 'settings'
        ? [{ rotate: rotationInterpolation }]
        : []),
      ...(name === 'play'
        ? [{ translateX: translateAnim }]
        : name === 'leaderboard'
        ? [{ translateY: translateAnim }]
        : []),
    ],
  };

  const content = (
    <Animated.View style={[styles.wrapper, animatedStyle, style]}>
      <Icon
        name={name}
        size={size}
        color={color}
        secondaryColor={secondaryColor}
        strokeWidth={strokeWidth}
        variant={variant}
        state={internalState}
        direction={direction}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      />
    </Animated.View>
  );

  if (interactive && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.touchable}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{
          selected: state === 'active' || state === 'selected',
          disabled: state === 'disabled',
        }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
