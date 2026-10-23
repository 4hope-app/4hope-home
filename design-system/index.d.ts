import * as React from "react";

// ---- Icon (Foundations) ----
export type IconName =
  | "Activity"
  | "Airplay"
  | "AlertCircle"
  | "AlertOctagon"
  | "AlertTriangle"
  | "AlignCenter"
  | "AlignJustify"
  | "AlignLeft"
  | "AlignRight"
  | "Anchor"
  | "Aperture"
  | "Archive"
  | "ArrowDown"
  | "ArrowDownCircle"
  | "ArrowDownLeft"
  | "ArrowDownRight"
  | "ArrowLeft"
  | "ArrowLeftCircle"
  | "ArrowRight"
  | "ArrowRightCircle"
  | "ArrowUp"
  | "ArrowUpCircle"
  | "ArrowUpLeft"
  | "ArrowUpRight"
  | "AtSign"
  | "Award"
  | "BarChart"
  | "BarChart2"
  | "Battery"
  | "BatteryCharging"
  | "Bell"
  | "BellOff"
  | "Bluetooth"
  | "Bold"
  | "Book"
  | "BookOpen"
  | "Bookmark"
  | "Box"
  | "Briefcase"
  | "Calendar"
  | "Camera"
  | "CameraOff"
  | "Cast"
  | "Check"
  | "CheckCircle"
  | "CheckSquare"
  | "ChevronDown"
  | "ChevronLeft"
  | "ChevronRight"
  | "ChevronUp"
  | "ChevronsDown"
  | "ChevronsLeft"
  | "ChevronsRight"
  | "ChevronsUp"
  | "Chrome"
  | "Circle"
  | "Clipboard"
  | "Clock"
  | "Cloud"
  | "CloudDrizzle"
  | "CloudLightning"
  | "CloudOff"
  | "CloudRain"
  | "CloudSnow"
  | "Code"
  | "Codepen"
  | "Codesandbox"
  | "Coffee"
  | "Columns"
  | "Command"
  | "Compass"
  | "Copy"
  | "CornerDownLeft"
  | "CornerDownRight"
  | "CornerLeftDown"
  | "CornerLeftUp"
  | "CornerRightDown"
  | "CornerRightUp"
  | "CornerUpLeft"
  | "CornerUpRight"
  | "Cpu"
  | "CreditCard"
  | "Crop"
  | "Crosshair"
  | "Database"
  | "Delete"
  | "Disc"
  | "Divide"
  | "DivideCircle"
  | "DivideSquare"
  | "DollarSign"
  | "Download"
  | "DownloadCloud"
  | "Dribbble"
  | "Droplet"
  | "Edit"
  | "Edit2"
  | "Edit3"
  | "ExternalLink"
  | "Eye"
  | "EyeOff"
  | "Facebook"
  | "FastForward"
  | "Feather"
  | "Figma"
  | "File"
  | "FileMinus"
  | "FilePlus"
  | "FileText"
  | "Film"
  | "Filter"
  | "Flag"
  | "Folder"
  | "FolderMinus"
  | "FolderPlus"
  | "Framer"
  | "Frown"
  | "Gift"
  | "GitBranch"
  | "GitCommit"
  | "GitMerge"
  | "GitPullRequest"
  | "Github"
  | "Gitlab"
  | "Globe"
  | "Grid"
  | "HardDrive"
  | "Hash"
  | "Headphones"
  | "Heart"
  | "HelpCircle"
  | "Hexagon"
  | "Home"
  | "Image"
  | "Inbox"
  | "Info"
  | "Instagram"
  | "Italic"
  | "Key"
  | "Layers"
  | "Layout"
  | "LifeBuoy"
  | "Link"
  | "Link2"
  | "Linkedin"
  | "List"
  | "Loader"
  | "Lock"
  | "LogIn"
  | "LogOut"
  | "Mail"
  | "Map"
  | "MapPin"
  | "Maximize"
  | "Maximize2"
  | "Meh"
  | "Menu"
  | "MessageCircle"
  | "MessageSquare"
  | "Mic"
  | "MicOff"
  | "Minimize"
  | "Minimize2"
  | "Minus"
  | "MinusCircle"
  | "MinusSquare"
  | "Monitor"
  | "Moon"
  | "MoreHorizontal"
  | "MoreVertical"
  | "MousePointer"
  | "Move"
  | "Music"
  | "Navigation"
  | "Navigation2"
  | "Octagon"
  | "Package"
  | "Paperclip"
  | "Pause"
  | "PauseCircle"
  | "PenTool"
  | "Percent"
  | "Phone"
  | "PhoneCall"
  | "PhoneForwarded"
  | "PhoneIncoming"
  | "PhoneMissed"
  | "PhoneOff"
  | "PhoneOutgoing"
  | "PieChart"
  | "Play"
  | "PlayCircle"
  | "Plus"
  | "PlusCircle"
  | "PlusSquare"
  | "Pocket"
  | "Power"
  | "Printer"
  | "RadioStateChecked"
  | "RadioStateDisabledChecked"
  | "RadioStateDisabledUnchecked"
  | "RadioStateUnchecked"
  | "RefreshCcw"
  | "RefreshCw"
  | "Repeat"
  | "Rewind"
  | "RotateCcw"
  | "RotateCw"
  | "Rss"
  | "Save"
  | "Scissors"
  | "Search2"
  | "SearchStateDefaultValueTypeFilled"
  | "SearchStateDefaultValueTypePlaceholder"
  | "SearchStateDisabledValueTypeFilled"
  | "SearchStateDisabledValueTypePlaceholder"
  | "Send"
  | "Server"
  | "Settings"
  | "Share"
  | "Share2"
  | "Shield"
  | "ShieldOff"
  | "ShoppingBag"
  | "ShoppingCart"
  | "Shuffle"
  | "Sidebar"
  | "SkipBack"
  | "SkipForward"
  | "Slack"
  | "Slash"
  | "Sliders"
  | "Smartphone"
  | "Smile"
  | "Speaker"
  | "Square"
  | "Star"
  | "StopCircle"
  | "Sun"
  | "Sunrise"
  | "Sunset"
  | "Tablet"
  | "TagSchemeDangerStateDefaultVariant"
  | "TagSchemeDangerStateDefaultVariant2"
  | "TagSchemeDangerStateHoverVariant"
  | "TagSchemeDangerStateHoverVariant2"
  | "TagSchemeDefaultStateDefaultVariant"
  | "TagSchemeDefaultStateDefaultVariant2"
  | "TagSchemeDefaultStateHoverVariant"
  | "TagSchemeDefaultStateHoverVariant2"
  | "TagSchemeNeutralStateDefaultVariant"
  | "TagSchemeNeutralStateDefaultVariant2"
  | "TagSchemeNeutralStateHoverVariant"
  | "TagSchemeNeutralStateHoverVariant2"
  | "TagSchemePositiveStateDefaultVariant"
  | "TagSchemePositiveStateDefaultVariant2"
  | "TagSchemePositiveStateHoverVariant"
  | "TagSchemePositiveStateHoverVariant2"
  | "TagSchemeWarningStateDefaultVariant"
  | "TagSchemeWarningStateDefaultVariant2"
  | "TagSchemeWarningStateHoverVariant"
  | "TagSchemeWarningStateHoverVariant2"
  | "Target"
  | "Terminal"
  | "Thermometer"
  | "ThumbsDown"
  | "ThumbsUp"
  | "ToggleLeft"
  | "ToggleRight"
  | "Tool"
  | "Trash"
  | "Trash2"
  | "Trello"
  | "TrendingDown"
  | "TrendingUp"
  | "Triangle"
  | "Truck"
  | "Tv"
  | "Twitch"
  | "Twitter"
  | "Type"
  | "Umbrella"
  | "Underline"
  | "Unlock"
  | "Upload"
  | "UploadCloud"
  | "User"
  | "UserCheck"
  | "UserMinus"
  | "UserPlus"
  | "UserX"
  | "Users"
  | "Video"
  | "VideoOff"
  | "Voicemail"
  | "Volume"
  | "Volume1"
  | "Volume2"
  | "VolumeX"
  | "Watch"
  | "Wifi"
  | "WifiOff"
  | "Wind"
  | "X"
  | "X16"
  | "XCircle"
  | "XOctagon"
  | "XSquare"
  | "Youtube"
  | "Zap"
  | "ZapOff"
  | "ZoomIn"
  | "ZoomOut";
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}
export declare const Icon: React.FC<IconProps>;

// ---- Avatar (Core) ----
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  /** Used for initials fallback + alt text. */
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  /** Gold ring (active player). */
  ring?: boolean;
  status?: "online" | "offline" | "live" | null;
}
export declare function Avatar(props: AvatarProps): JSX.Element;

// ---- AvatarGroup (Core) ----
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Array of Avatar props. */
  people?: AvatarProps[];
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Max avatars before an overflow +N pill. */
  max?: number;
}
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;

// ---- Badge (Core) ----
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  scheme?: "brand" | "danger" | "positive" | "neutral";
  /** Render as a bare status dot with no label. */
  dot?: boolean;
}
export declare function Badge(props: BadgeProps): JSX.Element;

// ---- Button (Core) ----
/**
 * 4Hope primary action button. Gold fill = primary brand action.
 *
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = gold fill. */
  variant?: "primary" | "neutral" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  /** Stretch to fill container width. */
  full?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;

// ---- Divider (Core) ----
export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Optional centered uppercase label (horizontal only). */
  label?: React.ReactNode;
}
export declare function Divider(props: DividerProps): JSX.Element;

// ---- IconButton (Core) ----
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon node (e.g. <Icon name="Settings" />). */
  icon: React.ReactNode;
  variant?: "primary" | "neutral" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;

// ---- Spinner (Core) ----
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  color?: string;
}
export declare function Spinner(props: SpinnerProps): JSX.Element;

// ---- Tag (Core) ----
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  scheme?: "brand" | "neutral" | "positive" | "warning" | "danger";
  variant?: "subtle" | "solid";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;

// ---- Checkbox (Forms) ----
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;

// ---- FormField (Forms) ----
export interface FormFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function FormField(props: FormFieldProps): JSX.Element;

// ---- Input (Forms) ----
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: boolean;
}
export declare function Input(props: InputProps): JSX.Element;

// ---- Radio (Forms) ----
export interface RadioProps {
  checked?: boolean;
  onChange?: (next: true) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;

// ---- Select (Forms) ----
export interface SelectOption { value: string; label: string; }
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Strings or {value,label} objects. */
  options?: (string | SelectOption)[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}
export declare function Select(props: SelectProps): JSX.Element;

// ---- Slider (Forms) ----
export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (next: number) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Slider(props: SliderProps): JSX.Element;

// ---- Switch (Forms) ----
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Switch(props: SwitchProps): JSX.Element;

// ---- Textarea (Forms) ----
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}
export declare function Textarea(props: TextareaProps): JSX.Element;

// ---- Breadcrumb (Navigation) ----
export interface BreadcrumbItem { label: React.ReactNode; href?: string; }
export interface BreadcrumbProps {
  items?: (string | BreadcrumbItem)[];
  style?: React.CSSProperties;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;

// ---- MenuItem (Navigation) ----
export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  /** Right-aligned keyboard shortcut text. */
  shortcut?: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}
export declare function MenuItem(props: MenuItemProps): JSX.Element;

// ---- NavPill (Navigation) ----
export interface NavPillItem { value: string; label: React.ReactNode; }
export interface NavPillProps {
  items?: (string | NavPillItem)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function NavPill(props: NavPillProps): JSX.Element;

// ---- Pagination (Navigation) ----
export interface PaginationProps {
  page?: number;
  total?: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): JSX.Element;

// ---- Tabs (Navigation) ----
export interface TabItem { value: string; label: React.ReactNode; }
export interface TabsProps {
  /** Strings or {value,label}. */
  tabs?: (string | TabItem)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;

// ---- Dialog (Feedback) ----
export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  /** Footer action nodes (e.g. Buttons). */
  actions?: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;

// ---- Notification (Feedback) ----
export interface NotificationProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  type?: "info" | "positive" | "warning" | "danger";
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function Notification(props: NotificationProps): JSX.Element;

// ---- ProgressBar (Feedback) ----
export interface ProgressBarProps {
  /** 0–100. */
  value?: number;
  height?: number;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;

// ---- Tooltip (Feedback) ----
export interface TooltipProps {
  label: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;

// ---- Accordion (Data) ----
export interface AccordionItemData { title: React.ReactNode; content: React.ReactNode; }
export interface AccordionProps {
  items?: AccordionItemData[];
  allowMultiple?: boolean;
  style?: React.CSSProperties;
}
export declare function Accordion(props: AccordionProps): JSX.Element;

// ---- Bracket (Data) ----
export interface BracketEntrant {
  /** Display name (player tag or team name) */
  name: string;
  /** Optional logo/avatar image URL; initials shown otherwise */
  avatar?: string;
}

export interface BracketMatchResult {
  winner?: "a" | "b" | null;
  scoreA?: number | null;
  scoreB?: number | null;
}

export interface BracketProps {
  /** Entrants in seed order (2–32). Non-power-of-two counts get byes; byes auto-advance. */
  entrants?: BracketEntrant[];
  /** Controlled results keyed "round-match" (e.g. "0-1"). Omit for uncontrolled. */
  results?: Record<string, BracketMatchResult>;
  onResultsChange?: (results: Record<string, BracketMatchResult>) => void;
  /** Click a side to advance it (default true) */
  interactive?: boolean;
  /** Show score chips / inputs (default true) */
  showScores?: boolean;
  /** Show match day · time labels (default true) */
  showTimes?: boolean;
  /** Show the champion block after the final (default true) */
  showChampion?: boolean;
  style?: React.CSSProperties;
}

/** Single-elimination bracket on the arena (ink) surface. Horizontal, scrolls when wide. */
export declare function Bracket(props: BracketProps): React.ReactElement;

/** Compute rounds from entrants + results (seeding, byes, winner propagation). */
export declare function buildBracketRounds(
  entrants: BracketEntrant[],
  results: Record<string, BracketMatchResult>
): Array<Array<{ a: BracketEntrant | null; b: BracketEntrant | null; winner: "a" | "b" | null; bye: boolean }>>;

// ---- Card (Data) ----
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `arena` = dark ink surface (native 4Hope look). */
  tone?: "default" | "arena";
  padding?: number;
  /** Adds lift + gold ring on hover. */
  interactive?: boolean;
}
export declare function Card(props: CardProps): JSX.Element;

// ---- Leaderboard (Data) ----
export interface LeaderboardPlayer { id: string; name: string; region?: string }

export interface LeaderboardProps {
  players?: LeaderboardPlayer[];
  onPlayersChange?: (players: LeaderboardPlayer[]) => void;
  /** Number of round columns */
  roundCount?: number;
  onRoundCountChange?: (count: number) => void;
  /** scores[playerId][roundIndex] = points (or null) */
  scores?: Record<string, Record<number, number | null>>;
  onScoresChange?: (scores: Record<string, Record<number, number | null>>) => void;
  /** Placement→points curve, e.g. [8,7,6,5,4,3,2,1]. Used only when entryMode="placement". */
  pointsScale?: number[];
  /** "points": type raw points into a cell. "placement": type a finish position, auto-converted via pointsScale. */
  entryMode?: "points" | "placement";
  /** "auto": rows sort by total desc. "manual": rows follow `order`, reorderable with row arrows. */
  rankMode?: "auto" | "manual";
  order?: string[];
  onOrderChange?: (order: string[]) => void;
  showPrize?: boolean;
  /** Prize per rank, ordered — prizeTiers[0] is 1st place, prizeTiers[1] is 2nd, etc. */
  prizeTiers?: string[];
  /** Rank at/above which rows get a highlighted "qualified" band, with a divider + label after it */
  cutoffRank?: number | null;
  cutoffLabel?: string;
  /** Controls the Name header filter input (shown inline in the header when onNameFilterChange is set) */
  nameFilter?: string;
  onNameFilterChange?: (value: string) => void;
  /** Controls the Region header filter input (shown inline in the header when onRegionFilterChange is set) */
  regionFilter?: string;
  onRegionFilterChange?: (value: string) => void;
  /** Renders all cells/actions inert (no edits, no add/remove) — for a shared view-only link */
  readOnly?: boolean;
  style?: React.CSSProperties;
}

/** Multi-round points leaderboard (TFT-style). Sticky rank/name/region/total columns, scrolling round cells. */
export declare function Leaderboard(props: LeaderboardProps): React.ReactElement;

// ---- StatCard (Data) ----
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** Delta text e.g. "+12%". */
  delta?: React.ReactNode;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  tone?: "default" | "arena";
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
