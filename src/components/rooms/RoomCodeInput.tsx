import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../design/tokens';
import { useTheme } from '../../design/theme';
import { sanitizeRoomCode } from '../../domain/multiplayer/roomManager';

export interface RoomCodeInputProps {
  value: string;
  onChangeText: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onPaste?: () => void;
  testID?: string;
}

export const RoomCodeInput: React.FC<RoomCodeInputProps> = ({
  value,
  onChangeText,
  placeholder = 'AB7KQ2',
  disabled = false,
  onPaste,
  testID = 'room-code-input',
}) => {
  const { theme } = useTheme();

  const handlePaste = async () => {
    if (onPaste) {
      onPaste();
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const clip = await navigator.clipboard.readText();
        if (clip) {
          onChangeText(sanitizeRoomCode(clip));
        }
      }
    } catch () {}
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.bgRecessed,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={(txt) => onChangeText(sanitizeRoomCode(txt))}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          accessibilityRole="none"
          accessibilityLabel="Enter 6-character room code"
        />

        <TouchableOpacity
          style={[
            styles.pasteButton,
            {
              backgroundColor: theme.accentOliveTint,
              borderColor: COLORS.gentleOlive,
            },
          ]}
          onPress={handlePaste}
          disabled={disabled}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Paste room code from clipboard"
        >
          <Text style={[styles.pasteButtonText, { color: COLORS.lunarShadow }]}>
            PASTE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.control,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 4,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  pasteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  pasteButtonText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: 0.8,
  },
});
