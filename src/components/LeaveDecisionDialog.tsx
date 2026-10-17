import { TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { LEAVE_KIND_LABELS } from '../constants/leaves';
import type { LeaveRequest } from '../types/leaves';
import { fieldProps } from '../utils/formik';
import { formatDate } from '../utils/format';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';

interface LeaveDecisionDialogProps {
  leave: LeaveRequest;
  decision: 'approved' | 'rejected';
  onClose: () => void;
  onSaved: () => void;
}

// An owner's answer to a leave request, with an optional note for the employee.
export function LeaveDecisionDialog({ leave, decision, onClose, onSaved }: LeaveDecisionDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const approve = decision === 'approved';
  const formik = useFormik<{ note: string }>({
    initialValues: { note: '' },
    onSubmit: async (v) => {
      setError(null);
      try {
        await apiClient.post(`/leaves/${leave.id}/decision`, { decision, note: v.note.trim() });
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <FormDialog
      title={`${approve ? 'Погодити' : leave.status === 'approved' ? 'Скасувати погодження' : 'Відхилити'}: ${leave.user.name}`}
      subtitle={`${LEAVE_KIND_LABELS[leave.kind]} ${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}, ${leave.days} дн.${leave.reason ? ` · «${leave.reason}»` : ''}`}
      submitting={formik.isSubmitting}
      submitLabel={approve ? 'Погодити' : 'Відхилити'}
      submitColor={approve ? 'primary' : 'error'}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection columns={1}>
        <TextField label="Коментар для працівника" {...fieldProps(formik, 'note', "Необов'язково")} multiline minRows={2} autoFocus />
      </FormSection>
    </FormDialog>
  );
}
