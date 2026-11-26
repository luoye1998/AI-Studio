import type { SVGProps } from 'react';
import {
  Activity,
  Aperture,
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Clock,
  Copy,
  Drama,
  Eye,
  FileText,
  Globe2,
  Images,
  Info,
  LayoutGrid,
  Layers3,
  ListTree,
  Lock,
  LockOpen,
  MoreHorizontal,
  Network,
  Play,
  Plus,
  RotateCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  User,
  Users,
  Wallet,
  Waypoints,
  X,
  Zap,
} from 'lucide-react';

export type IconName =
  | 'flow' | 'graph' | 'layers' | 'film' | 'wallet' | 'book' | 'settings' | 'spark'
  | 'plus' | 'check' | 'lock' | 'unlock' | 'play' | 'chevron' | 'chevronDown' | 'x'
  | 'search' | 'copy' | 'refresh' | 'download' | 'trash' | 'alert' | 'info' | 'clock'
  | 'user' | 'camera' | 'wand' | 'grid' | 'arrow' | 'dots' | 'eye' | 'bolt' | 'shield';

const MAP = {
  flow: Waypoints,
  graph: Network,
  layers: Layers3,
  film: Clapperboard,
  wallet: Wallet,
  book: BookOpen,
  settings: Settings2,
  spark: Sparkles,
  plus: Plus,
  check: Check,
  lock: Lock,
  unlock: LockOpen,
  play: Play,
  chevron: ChevronRight,
  chevronDown: ChevronDown,
  x: X,
  search: Search,
  copy: Copy,
  refresh: RotateCw,
  download: ArrowDownToLine,
  trash: Trash2,
  alert: TriangleAlert,
  info: Info,
  clock: Clock,
  user: User,
  camera: Camera,
  wand: Sparkles,
  grid: LayoutGrid,
  arrow: ArrowRight,
  dots: MoreHorizontal,
  eye: Eye,
  bolt: Zap,
  shield: ShieldCheck,
} as const;

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp strokeWidth={1.6} aria-hidden {...props} />;
}

/** 品牌标记：两道细折线构成的 W，落一个香槟金点 */
export function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 7.5 8.6 16.5 12 10.2" />
      <path d="M12 10.2 15.4 16.5 19.5 7.5" />
    </svg>
  );
}

/** 阶段图标：九阶段专属意象 */
export const STAGE_ICONS = {
  concept: Target,
  characters: Users,
  world: Globe2,
  outline: ListTree,
  script: FileText,
  stress: Activity,
  lira: Images,
  acting: Drama,
  cinedance: Aperture,
} as const;

export type StageIconName = keyof typeof STAGE_ICONS;

export { Activity, Aperture, FileText, Globe2, Images, ListTree, Target, Users, Drama };
