import { MenuItem, TextField } from '@mui/material';
import { PURCHASE_STATUS, PURCHASE_STATUS_OPTIONS } from '../constants/finance';
import type { PurchaseStatus } from '../types/finance';

// A compact status picker for purchase rows, colored like the status.
export function PurchaseStatusSelect({ value, onChange }: { value: PurchaseStatus; onChange: (status: PurchaseStatus) => void }) {
  const color = PURCHASE_STATUS[value].color;
  return (
    <TextField
      select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value as PurchaseStatus)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        minWidth: 140,
        '& .MuiInputBase-input': { py: 0.5, fontSize: 13, fontWeight: 600 },
        '& .MuiInputBase-root': { color: color === 'default' ? 'text.secondary' : `${color}.main` },
      }}
    >
      {PURCHASE_STATUS_OPTIONS.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
