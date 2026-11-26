import { STAGE_ICONS } from './Icons';
import type { StageId } from '../core/types';

export default function StageIcon({ id, size = 15 }: { id: StageId; size?: number }) {
  const Cmp = STAGE_ICONS[id];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={1.5} aria-hidden />;
}
