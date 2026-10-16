import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { Chip, Stack } from '@mui/material';
import type { ClientPapers, PaperState } from '../types/clients';
import { formatDate } from '../utils/format';

function PaperChip({ label, state, size }: { label: string; state: PaperState | null; size: 'small' | 'medium' }) {
  if (!state) {
    return <Chip size={size} variant="outlined" color="warning" icon={<ErrorOutlineIcon />} label={`${label}: немає`} />;
  }
  if (!state.signedAt) {
    return <Chip size={size} variant="outlined" icon={<HourglassEmptyIcon />} label={`${label}: не підписано`} />;
  }
  return <Chip size={size} color="success" variant="outlined" icon={<CheckCircleOutlineIcon />} label={`${label} ✓ ${formatDate(state.signedAt)}`} />;
}

// The client's NDA and framework contract at a glance: missing / unsigned / signed with date.
export function PaperChips({ papers, size = 'medium' }: { papers?: ClientPapers; size?: 'small' | 'medium' }) {
  if (!papers) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      <PaperChip label="NDA" state={papers.nda} size={size} />
      <PaperChip label="Договір" state={papers.framework} size={size} />
    </Stack>
  );
}
