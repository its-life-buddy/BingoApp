// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark';

export const REFERENCE_PALETTE = {
  primaryOrange: '#FF7A00',   // Primary Action Orange
  secondaryOrange: '#FF9A3D', // Secondary Orange Accent
  cleanWhite: '#FFFFFF',      // Background / Card Surface
  softOrange: '#FFF7EF',      // Soft Background Tint
  lunarShadow: '#171717',     // Dark Charcoal Text / Strong Element
  gentleOlive: '#FF7A00',     // Backwards-compatible accent mapped to Orange
  winterHazel: '#FF9A3D',     // Backwards-compatible accent mapped to Secondary Orange
  grayWhisper: '#FFF7EF',     // Soft Tint Backdrop
};

export interface ThemeColors {
  isDark: boolean;
  mode: ThemeMode;
  bgCanvas: string;
  bgCard: string;
  bgCardElevated: string;
  bgSubtle: string;
  bgRecessed: string;
  borderSubtle: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accentOlive: string;
  accentOliveTint: string;
  accentHazel: string;
  accentHazelTint: string;
  primaryOrange: string;
  primaryOrangeTint: string;
  secondaryOrange: string;
  dockBg: string;
  dockBorder: string;
  activePillBg: string;
  activePillText: string;
  activePillIcon: string;
  inactiveIcon: string;
  daubWell: string;
  daubBorder: string;
  daubPip: string;
  cardShadow: string;
}

export const LIGHT_THEME: ThemeColors = {
  isDark: false,
  mode: 'light',
  bgCanvas: '#FFF7EF',                      // Soft Warm Background
  bgCard: '#FFFFFF',                        // Pure White Card
  bgCardElevated: '#FFFFFF',
  bgSubtle: '#FFF0E0',
  bgRecessed: '#FEEAD6',
  borderSubtle: '#FFE0C4',
  borderStrong: '#FFC58D',
  textPrimary: '#171717',                   // Dark High-Contrast Text
  textSecondary: '#737373',                 // Secondary Muted Text
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  primaryOrange: '#FF7A00',
  primaryOrangeTint: 'rgba(255, 122, 0, 0.12)',
  secondaryOrange: '#FF9A3D',
  accentOlive: '#FF7A00',                   // Back-compatible
  accentOliveTint: 'rgba(255, 122, 0, 0.12)',
  accentHazel: '#FF9A3D',
  accentHazelTint: 'rgba(255, 154, 61, 0.16)',
  dockBg: '#FFFFFF',                        // Clean White Dock
  dockBorder: '#FFE0C4',
  activePillBg: '#FF7A00',                  // Primary Orange Pill
  activePillText: '#FFFFFF',
  activePillIcon: '#FFFFFF',
  inactiveIcon: '#737373',
  daubWell: 'rgba(255, 122, 0, 0.15)',
  daubBorder: '#FF7A00',
  daubPip: '#FF7A00',
  cardShadow: 'rgba(255, 122, 0, 0.08)',
};

export const DARK_THEME: ThemeColors = {
  isDark: true,
  mode: 'dark',
  bgCanvas: '#171717',                      // Dark Theme Canvas
  bgCard: '#222222',                        // Elevated Dark Card
  bgCardElevated: '#2A2A2A',
  bgSubtle: '#2E2E2E',
  bgRecessed: '#1E1E1E',
  borderSubtle: '#383838',
  borderStrong: '#4D4D4D',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
  textInverse: '#171717',
  primaryOrange: '#FF7A00',
  primaryOrangeTint: 'rgba(255, 122, 0, 0.20)',
  secondaryOrange: '#FF9A3D',
  accentOlive: '#FF7A00',
  accentOliveTint: 'rgba(255, 122, 0, 0.20)',
  accentHazel: '#FF9A3D',
  accentHazelTint: 'rgba(255, 154, 61, 0.20)',
  dockBg: '#222222',
  dockBorder: '#383838',
  activePillBg: '#FF7A00',
  activePillText: '#FFFFFF',
  activePillIcon: '#FFFFFF',
  inactiveIcon: '#8E8E93',
  daubWell: 'rgba(255, 122, 0, 0.22)',
  daubBorder: '#FF7A00',
  daubPip: '#FF7A00',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
};

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: LIGHT_THEME,
  mode: 'light',
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Light theme (Reference 1 & 3 showcase light mode as dominant baseline)
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = useMemo(() => {
    return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        isDark: mode === 'dark',
        toggleTheme,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
