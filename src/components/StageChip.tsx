import { Chip, type ChipProps } from '@mui/material';
import { stageInfo } from '../constants/stages';
import type { OrderStage } from '../types/orders';

export function StageChip({ stage, size = 'small' }: { stage: OrderStage; size?: ChipProps['size'] }) {
  const info = stageInfo(stage);
  return <Chip size={size} label={info.label} title={info.hint} sx={{ bgcolor: info.tint, color: info.color }} />;
}
