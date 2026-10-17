import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { LEAVE_KIND_OPTIONS } from '../constants/leaves';
import type { LeaveKind } from '../types/leaves';
import { fieldProps, REQUIRED } from '../utils/formik';
import { dayInput, daysWord } from '../utils/format';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

interface LeaveValues {
  kind: LeaveKind;
  startDate: string;
  endDate: string;
  reason: string;
}

// Calendar days, both ends included.
function daysBetween(start: string, end: string): number | null {
  if (!start || !end || end < start) return null;
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

// A leave request for oneself; an owner approves or rejects it.
export function LeaveDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik<LeaveValues>({
    initialValues: { kind: 'vacation', startDate: dayInput(7), endDate: dayInput(13), reason: '' },
    validate: (v) => {
      const errors: Partial<Record<keyof LeaveValues, string>> = {};
      if (!v.startDate) errors.startDate = REQUIRED;
      if (!v.endDate) errors.endDate = REQUIRED;
      else if (v.startDate && v.endDate < v.startDate) errors.endDate = 'Раніше за початок';
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      try {
        await apiClient.post('/leaves', { ...v, reason: v.reason.trim() });
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const days = daysBetween(formik.values.startDate, formik.values.endDate);

  return (
    <FormDialog
      title="Заявка на відсутність"
      subtitle="Власник погодить або відхилить її; рішення побачите тут"
      submitting={formik.isSubmitting}
      submitLabel="Надіслати"
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection>
        <TextField select label="Тип" {...fieldProps(formik, 'kind')} sx={FULL_ROW}>
          {LEAVE_KIND_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField type="date" label="З" {...fieldProps(formik, 'startDate')} slotProps={{ inputLabel: { shrink: true } }} required />
        <TextField type="date" label="По" {...fieldProps(formik, 'endDate', 'Включно')} slotProps={{ inputLabel: { shrink: true } }} required />
        <Box sx={FULL_ROW}>
          <Typography variant="body2" color="text.secondary">
            {days ? `Разом: ${daysWord(days)} (календарних)` : ''}
          </Typography>
        </Box>
        <TextField label="Коментар" {...fieldProps(formik, 'reason', "Необов'язково")} multiline minRows={2} sx={FULL_ROW} />
      </FormSection>
    </FormDialog>
  );
}
