import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GameButton } from '../components/common/GameButton';
import { GameCard } from '../components/common/GameCard';
import { GameInput } from '../components/common/GameInput';
import { RouteHeader } from '../components/common/RouteHeader';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../design/tokens';
import { LockIcon, JoinRoomIcon } from '../components/icons/CustomIcons';
import { useTheme } from '../design/theme';
import { sanitizeRoomCode } from '../domain/multiplayer/roomManager';

interface JoinRoomScreenProps {
  onJoin: (roomId: string, password?: string) => Promise<void>;
  onBack: () => void;
  initialRoomId?: string;
  errorMessage?: string;
}

export const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  onJoin,
  onBack,
  initialRoomId = '',
  errorMessage,
}) => {
  const { theme } = useTheme();
  const [roomId, setRoomId] = useState(sanitizeRoomCode(initialRoomId));
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setRoomId(sanitizeRoomCode(text));
      }
    } catch {}
  };

  const handleJoin = async () => {
    const cleanCode = sanitizeRoomCode(roomId);
    if (!cleanCode) return;
    setIsJoining(true);
    try {
      await onJoin(cleanCode, password.trim());
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCanvas }]}>
      <RouteHeader title="Join Room" onBack={onBack} />

      <View style={styles.contentWrap}>
        <GameCard
          style={[
            styles.card,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Enter the room code (e.g. AB7K2) provided by your host.
          </Text>

          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: COLORS.dangerRed }]}>
              <Text style={[styles.errorText, { color: COLORS.dangerRed }]}>{errorMessage}</Text>
            </View>
          )}

          <GameInput
            label="ROOM CODE"
            value={roomId}
            onChangeText={(txt) => setRoomId(sanitizeRoomCode(txt))}
            placeholder="e.g. AB7K2"
            autoCapitalize="characters"
            maxLength={6}
            rightAction={
              <TouchableOpacity
                onPress={handlePaste}
                style={[styles.pasteBadge, { backgroundColor: theme.bgRecessed, borderColor: theme.borderSubtle }]}
                accessibilityRole="button"
                accessibilityLabel="Paste room code from clipboard"
              >
                <Text style={[styles.pasteBadgeText, { color: COLORS.primaryOrange }]}>Paste</Text>
              </TouchableOpacity>
            }
          />

          <GameInput
            label="PASSCODE (IF PRIVATE)"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter 4-digit code"
            secureTextEntry
            maxLength={12}
            icon={<LockIcon size={16} color={theme.textMuted} />}
          />

          <GameButton
            title="Join Match ↗"
            icon={<JoinRoomIcon size={18} color="#FFFFFF" />}
            variant="primary"
            size="lg"
            fullWidth
            loading={isJoining}
            disabled={roomId.trim().length < 5}
            onPress={handleJoin}
            style={styles.joinBtn}
          />
        </GameCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    padding: SPACING.lg, // 16px
  },
  card: {
    padding: SPACING.lg, // 16px
    borderRadius: RADIUS.hero,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  cardDesc: {
    fontSize: 13,
    marginBottom: SPACING.md,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  errorBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  pasteBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.compact,
    borderWidth: 1,
  },
  pasteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  joinBtn: {
    marginTop: SPACING.sm,
  },
});
