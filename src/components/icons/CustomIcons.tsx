import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Svg, Path, Circle, Line } from 'react-native-svg';
import { Icon } from './Icon';
import { AnimatedIcon } from './AnimatedIcon';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseIconProps, IconName, IconState, IconVariant } from './types';
import { ICON_COLORS, ICON_SIZES } from '../../design/tokens';

export interface IconProps extends BaseIconProps {
  interactive?: boolean;
  onPress?: () => void;
  triggerAnimation?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  muted?: boolean;
  active?: boolean;
  connected?: boolean;
}

// Re-export core primitives and definitions
export { Icon } from './Icon';
export { AnimatedIcon } from './AnimatedIcon';
export { AppIconVector } from './AppIconVector';
export { IconSpecimenSheet } from './IconSpecimenSheet';
export * from './types';
export { ICON_DEFINITIONS } from './iconPaths';

/**
 * Backward compatibility helper for legacy SvgIcon usages
 */
export const SvgIcon: React.FC<{
  size?: number;
  viewBox?: string;
  paths?: any[];
  circles?: any[];
  style?: ViewStyle;
}> = ({ size = 24, style }) => {
  return <Icon name="bingo" size={size} style={style} />;
};

// ============================================================================
// 1. PRIMARY NAVIGATION & BRAND ICONS
// ============================================================================
export const HomeIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Home',
}) => (
  <AnimatedIcon
    name="home"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="image"
  />
);

export const PlayIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Play',
}) => (
  <AnimatedIcon
    name="play"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={interactive ? 'button' : 'image'}
  />
);

export const LeaderboardIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Leaderboard',
}) => (
  <AnimatedIcon
    name="leaderboard"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={interactive ? 'button' : 'image'}
  />
);

export const ProfileIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Profile',
}) => (
  <AnimatedIcon
    name="profile"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={interactive ? 'button' : 'image'}
  />
);

// ============================================================================
// 2. ORIGINAL BINGO IDENTITY & GAMEPLAY ICONS
// ============================================================================
export const BingoIdentityIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant,
  state = 'idle',
  style,
  accessibilityLabel = 'Bingo Emblem',
}) => (
  <AnimatedIcon
    name="bingo"
    size={size}
    color={color}
    variant={variant}
    state={state}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const BingoIcon = BingoIdentityIcon;

export const MarkIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.playEmerald,
  variant,
  state = 'idle',
  style,
}) => (
  <AnimatedIcon
    name="mark"
    size={size}
    color={color}
    variant={variant}
    state={state}
    style={style}
    accessibilityLabel="Mark daub seal"
  />
);

export const UnmarkIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.muted,
  style,
}) => (
  <AnimatedIcon
    name="unmark"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Unmark cell"
  />
);

export const PauseIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="pause"
    size={size}
    color={color}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel="Pause match"
  />
);

export const ResumeIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.playEmerald,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="resume"
    size={size}
    color={color}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel="Resume match"
  />
);

export const ShuffleIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="shuffle"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Shuffle"
  />
);

export const PreviousIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="previous"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Previous"
  />
);

export const NextIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="next"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Next"
  />
);

export const FinishIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="finish"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Match finish"
  />
);

export const WinnerIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="winner"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Victory winner"
  />
);

export const NumberGridIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="number"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Number matrix"
  />
);

// ============================================================================
// 3. NAVIGATION & STRUCTURAL ICONS
// ============================================================================
export const ChevronIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  direction = 'left',
  style,
}) => (
  <Icon
    name="chevron"
    size={size}
    color={color}
    direction={direction}
    style={style}
    accessibilityLabel={`Chevron ${direction}`}
  />
);

export const BackIcon: React.FC<IconProps> = (props) => (
  <ChevronIcon direction="left" {...props} />
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <ChevronIcon direction="right" {...props} />
);

export const CloseIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="close"
    size={size}
    color={color}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel="Close"
  />
);

export const SettingsIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  state = 'idle',
  style,
  onPress,
  interactive,
  triggerAnimation,
}) => (
  <AnimatedIcon
    name="settings"
    size={size}
    color={color}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    triggerAnimation={triggerAnimation}
    accessibilityLabel="Settings"
  />
);

// ============================================================================
// 4. GAME MODES & EXPERIENCE IDENTITIES
// ============================================================================
export const RobotIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.playEmerald,
  style,
}) => (
  <AnimatedIcon
    name="solo"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Solo AI Robot"
  />
);

export const SoloIcon = RobotIcon;

export const FriendIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="private_room"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Private Room with Friend"
  />
);

export const PuzzleIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.playEmerald,
  style,
}) => (
  <AnimatedIcon
    name="daily"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Daily Puzzle Challenge"
  />
);

export const LocalIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.info,
  style,
}) => (
  <AnimatedIcon
    name="shuffle"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Local Practice Match"
  />
);

export const RoomIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="private_room"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Room"
  />
);

export const UsersIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="multiplayer"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Multiplayer Players"
  />
);

export const MultiplayerIcon = UsersIcon;

export const RankedLightningIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant = 'filled',
  style,
}) => (
  <AnimatedIcon
    name="ranked"
    size={size}
    color={color}
    variant={variant}
    style={style}
    accessibilityLabel="Ranked Competitive Lightning"
  />
);

export const DailyIcon = PuzzleIcon;
export const PrivateRoomIcon = RoomIcon;

export const JoinRoomIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="join_room"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Join Room"
  />
);

export const CreateRoomIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="create_room"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Create Room"
  />
);

// ============================================================================
// 5. PLAYER, TROPHY, RANK & STREAK
// ============================================================================
export const TrophyIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="trophy"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Trophy"
  />
);

export const CrownIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="winner"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Crown"
  />
);

export const RankIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="rank"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Rank Star"
  />
);

export const StreakIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="streak"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Win Streak Flame"
  />
);

export const AchievementIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="achievement"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Achievement Medal"
  />
);

export const LevelIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.gold,
  style,
}) => (
  <AnimatedIcon
    name="level"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Level Tier"
  />
);

export const HistoryIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="history"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Match History"
  />
);

export const StatisticsIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="statistics"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Player Statistics"
  />
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="daily"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Calendar Date"
  />
);

// ============================================================================
// 6. UTILITY, AUDIO, SENSORS & SYSTEM
// ============================================================================
export const VolumeIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  muted = false,
  style,
  interactive,
  onPress,
}) => (
  <AnimatedIcon
    name={muted ? 'mute' : 'sound'}
    size={size}
    color={muted ? ICON_COLORS.muted : color}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={muted ? 'Sound muted' : 'Sound enabled'}
  />
);

export const MuteIcon: React.FC<IconProps> = (props) => (
  <VolumeIcon muted={true} {...props} />
);

export const SpeechIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  active = true,
  style,
  interactive,
  onPress,
}) => (
  <AnimatedIcon
    name="speech"
    size={size}
    color={active ? color : ICON_COLORS.muted}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={active ? 'Speech caller active' : 'Speech caller muted'}
  />
);

export const VibrationIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="vibration"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Haptic Vibration"
  />
);

export const LockIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.muted,
  style,
}) => (
  <AnimatedIcon
    name="locked"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Locked"
  />
);

export const UnlockIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.muted,
  style,
}) => (
  <AnimatedIcon
    name="unlocked"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Unlocked"
  />
);

export const RefreshIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
  interactive,
  onPress,
  triggerAnimation,
}) => (
  <AnimatedIcon
    name="refresh"
    size={size}
    color={color}
    interactive={interactive}
    onPress={onPress}
    style={style}
    triggerAnimation={triggerAnimation}
    accessibilityLabel="Refresh"
  />
);

export const ShareIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="share"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Share"
  />
);

export const CopyIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="copy"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Copy to clipboard"
  />
);

export const CheckIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.playEmerald,
  style,
}) => (
  <AnimatedIcon
    name="success"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Success verified"
  />
);

export const WarningIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.warning,
  style,
}) => (
  <AnimatedIcon
    name="warning"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Warning"
  />
);

export const ErrorIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.danger,
  style,
}) => (
  <AnimatedIcon
    name="error"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Error"
  />
);

export const SearchIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="search"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Search"
  />
);

export const NotificationsIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="notifications"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Notifications"
  />
);

export const InfoIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="information"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Information"
  />
);

export const HelpIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="help"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Help"
  />
);

export const MoreIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="more"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="More options"
  />
);

export const LoadingIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
}) => (
  <AnimatedIcon
    name="loading"
    size={size}
    color={color}
    style={style}
    accessibilityLabel="Loading"
  />
);

export const TimerIcon: React.FC<IconProps> = (props) => (
  <HistoryIcon {...props} />
);

export const ConnectionIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.sm,
  connected = true,
  color,
  style,
}) => (
  <AnimatedIcon
    name={connected ? 'success' : 'error'}
    size={size}
    color={color || (connected ? ICON_COLORS.playEmerald : ICON_COLORS.danger)}
    style={style}
    accessibilityLabel={connected ? 'Connected' : 'Disconnected'}
  />
);

export const DisconnectIcon: React.FC<IconProps> = (props) => (
  <ConnectionIcon connected={false} color={ICON_COLORS.danger} {...props} />
);

export const SunIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="sun"
    size={size}
    color={color}
    style={style}
    interactive={interactive}
    onPress={onPress}
    accessibilityLabel="Light Theme Sun"
  />
);

export const MoonIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="moon"
    size={size}
    color={color}
    style={style}
    interactive={interactive}
    onPress={onPress}
    accessibilityLabel="Dark Theme Moon"
  />
);

export const HeartIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.primary,
  style,
  onPress,
  interactive,
}) => (
  <AnimatedIcon
    name="heart"
    size={size}
    color={color}
    style={style}
    interactive={interactive}
    onPress={onPress}
    accessibilityLabel="Favorite"
  />
);

export const TicketIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Match Ticket',
}) => (
  <AnimatedIcon
    name="ticket"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const CoinStackIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Gold Coins',
}) => (
  <AnimatedIcon
    name="coin_stack"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const GemstoneIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.info,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Gems',
}) => (
  <AnimatedIcon
    name="gemstone"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const LightningIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Lightning Power-Up',
}) => (
  <AnimatedIcon
    name="lightning"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const DaubStarIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant = 'filled',
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Dauber Seal Stamp',
}) => (
  <AnimatedIcon
    name="daub_star"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const WifiOffIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.danger,
  style,
  accessibilityLabel = 'Connection Lost',
}) => (
  <AnimatedIcon
    name="wifi_off"
    size={size}
    color={color}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const TargetIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.playEmerald,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Target Power-Up',
}) => (
  <AnimatedIcon
    name="target"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const ShieldIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.secondary,
  variant,
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Security Shield',
}) => (
  <AnimatedIcon
    name="shield"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const FireIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = '#F97316',
  variant = 'filled',
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Streak Multiplier',
}) => (
  <AnimatedIcon
    name="fire"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

export const SparklesIcon: React.FC<IconProps> = ({
  size = ICON_SIZES.md,
  color = ICON_COLORS.gold,
  variant = 'filled',
  state = 'idle',
  interactive,
  onPress,
  style,
  accessibilityLabel = 'Sparkles',
}) => (
  <AnimatedIcon
    name="sparkles"
    size={size}
    color={color}
    variant={variant}
    state={state}
    interactive={interactive}
    onPress={onPress}
    style={style}
    accessibilityLabel={accessibilityLabel}
  />
);

// Semantic aliases matching exact mission directive specifications
export const IconTicket = TicketIcon;
export const IconTrophy = TrophyIcon;
export const IconLightning = LightningIcon;
export const IconCoinStack = CoinStackIcon;
export const IconGemstone = GemstoneIcon;
export const IconDaubStar = DaubStarIcon;
export const IconWifiOff = WifiOffIcon;
export const IconRefresh = RefreshIcon;
export const IconTarget = TargetIcon;
export const IconShield = ShieldIcon;
export const IconFire = FireIcon;
export const IconSparkles = SparklesIcon;

// ============================================================================
// 10. SOCIAL AUTH & PROFILE EDITING ICONS
// ============================================================================
export const GoogleIcon: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 20,
  style,
}) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  </View>
);

export const FacebookIcon: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 20,
  style,
}) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#1877F2" />
      <Path
        d="M15.12 12.75l.5-3.26h-3.13V7.37c0-.89.44-1.76 1.83-1.76h1.42V2.84s-1.29-.22-2.52-.22c-2.57 0-4.25 1.56-4.25 4.38v2.49H6.1v3.26h2.87V21.6a12.08 12.08 0 003.54 0v-8.85h2.61z"
        fill="#FFFFFF"
      />
    </Svg>
  </View>
);

export const EditPencilIcon: React.FC<{ size?: number; color?: string; style?: ViewStyle }> = ({
  size = 16,
  color = '#E6CA9A',
  style,
}) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  </View>
);

export const EyeIcon: React.FC<{ size?: number; color?: string; style?: ViewStyle }> = ({
  size = 20,
  color = '#B8C665',
  style,
}) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  </View>
);

export const EyeSlashIcon: React.FC<{ size?: number; color?: string; style?: ViewStyle }> = ({
  size = 20,
  color = '#B8C665',
  style,
}) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  </View>
);




