import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TabDestination } from '../../domain/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../design/tokens';
import { HomeIcon, LeaderboardIcon, ProfileIcon } from '../icons/CustomIcons';
import { useTheme } from '../../design/theme';

interface BottomNavBarProps {
  currentTab: TabDestination;
  onSelectTab: (tab: TabDestination) => void;
}

/**
 * Floating Console Dock with Illuminated Active Pill
 * Directly extracted from Reference 3 and Reference 1.
 * Style is strictly preserved as requested.
 * Home icon updated to match Reference 1 with Gentle Olive accent dot.
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const { theme, isDark } = useTheme();

  const tabs: Array<{ key: TabDestination; label: string; icon: (active: boolean) => React.ReactNode }> = [
    {
      key: 'PLAY',
      label: 'Home',
      icon: (active) => (
        <HomeIcon
          size={17}
          color={active ? COLORS.activeTabIcon : (isDark ? '#A3A3A3' : COLORS.inactiveTabIcon)}
          variant={active ? 'filled' : 'outline'}
          state={active ? 'active' : 'idle'}
        />
      ),
    },
    {
      key: 'LEADERBOARD',
      label: 'Ranks',
      icon: (active) => (
        <LeaderboardIcon
          size={17}
          color={active ? COLORS.activeTabIcon : (isDark ? '#A3A3A3' : COLORS.inactiveTabIcon)}
          variant={active ? 'filled' : 'outline'}
          state={active ? 'active' : 'idle'}
        />
      ),
    },
    {
      key: 'PROFILE',
      label: 'Profile',
      icon: (active) => (
        <ProfileIcon
          size={17}
          color={active ? COLORS.activeTabIcon : (isDark ? '#A3A3A3' : COLORS.inactiveTabIcon)}
          variant={active ? 'filled' : 'outline'}
          state={active ? 'active' : 'idle'}
        />
      ),
    },
  ];

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.consoleDock,
          {
            backgroundColor: theme.bgCard,
            borderColor: isDark ? theme.borderSubtle : 'rgba(255, 122, 0, 0.2)',
          },
        ]}
        accessibilityRole="tablist"
      >
        {/* Specular Edge Hairline */}
        <View style={styles.dockTopBevel} />

        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.dockItem, isActive && styles.dockItemActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
            >
              {isActive ? (
                <View style={styles.activePill}>
                  {tab.icon(true)}
                  <Text style={styles.activeLabel}>{tab.label}</Text>
                </View>
              ) : (
                <View style={styles.inactivePill}>
                  {tab.icon(false)}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  consoleDock: {
    width: 'auto',
    alignSelf: 'center',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 33,
    paddingHorizontal: 8,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.2)',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  dockTopBevel: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  dockItemActive: {
    transform: [{ scale: 1 }],
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.activeTabBg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gentleOlive,
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.activeTabText,
    letterSpacing: -0.2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  inactivePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
