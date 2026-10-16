import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FormSectionProps {
  title?: ReactNode;
  hint?: ReactNode;
  // Fields per row from the small breakpoint up; one per row on phones.
  columns?: 1 | 2 | 3;
  children: ReactNode;
}

// A titled group of related fields laid out on a grid. A field spans the whole row with
// `sx={FULL_ROW}` (from ./grid).
export function FormSection({ title, hint, columns = 2, children }: FormSectionProps) {
  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      )}
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` },
          gap: 2,
          mt: title || hint ? 1.5 : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
