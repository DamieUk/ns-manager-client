import { MenuItem, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { CONTRACT_TYPE_OPTIONS } from '../constants/documents';
import type { Contract, ContractType } from '../types/clients';
import type { OrderSummary } from '../types/orders';
import { fieldError, fieldProps } from '../utils/formik';
import { toDateInput } from '../utils/format';
import { FileDropzone } from './FileDropzone';
import { FormDialog } from './form/FormDialog';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

interface ContractDialogProps {
  clientId: string;
  // Edit this contract; otherwise create a new one of `defaultType`.
  contract: Contract | null;
  defaultType: ContractType;
  orders: Array<Pick<OrderSummary, 'id' | 'number' | 'product' | 'quantity'>>;
  // For a new annex opened from a batch page: that batch, and no other type to choose.
  defaultOrder?: string;
  lockType?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface ContractValues {
  type: ContractType;
  order: string;
  number: string;
  signedAt: string;
  title: string;
  files: File[];
}

const TITLE_HINT: Record<ContractType, string> = {
  nda: 'NDA',
  framework: 'Рамковий договір',
  annex: 'Додаток до договору',
};

const PURPOSE: Record<ContractType, string> = {
  nda: 'Підписуємо першим, до отримання BOM',
  framework: 'Один на клієнта: загальні умови співпраці',
  annex: 'Один на партію: ціна, кількість і терміни',
};

// NDA, framework contract or an annex for one batch, with its number, signing date and the
// signed scans. Saving with a signing date marks the contract as in force.
export function ContractDialog({ clientId, contract, defaultType, orders, defaultOrder, lockType, onClose, onSaved }: ContractDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<ContractValues>({
    initialValues: {
      type: contract?.type ?? defaultType,
      order: contract?.order ?? defaultOrder ?? '',
      number: contract?.number ?? '',
      signedAt: toDateInput(contract?.signedAt),
      title: contract?.title ?? '',
      files: [],
    },
    validate: (v) => {
      const errors: Partial<Record<keyof ContractValues, string>> = {};
      if (v.type === 'annex' && !v.order) errors.order = 'Оберіть партію, яку покриває додаток';
      const hasScans = (contract?.documents.length ?? 0) > 0 || v.files.length > 0;
      if (v.signedAt && !hasScans) errors.files = 'Додайте скан підписаного документа';
      return errors;
    },
    onSubmit: async (v) => {
      setError(null);
      const data = new FormData();
      data.append('client', clientId);
      data.append('type', v.type);
      data.append('number', v.number.trim());
      data.append('signedAt', v.signedAt);
      data.append('order', v.type === 'annex' ? v.order : '');
      if (v.title.trim()) data.append('title', v.title.trim());
      v.files.forEach((f) => data.append('files', f));
      try {
        if (contract) await apiClient.put(`/contracts/${contract._id}`, data);
        else await apiClient.post('/contracts', data);
        onSaved();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  const { type, number } = formik.values;

  return (
    <FormDialog
      title={contract ? contract.title : `Новий документ: ${TITLE_HINT[type]}`}
      subtitle={PURPOSE[type]}
      submitting={formik.isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <FormSection title="Документ">
        <TextField select label="Тип" {...fieldProps(formik, 'type')} disabled={lockType}>
          {CONTRACT_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        {type === 'annex' ? (
          <TextField select label="Партія" {...fieldProps(formik, 'order')} disabled={lockType} required>
            {orders.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                № {o.number} · {o.product.name} × {o.quantity}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <span />
        )}
        <TextField label="Номер" {...fieldProps(formik, 'number')} placeholder="наприклад 12/2026" />
        <TextField
          type="date"
          label="Дата підпису"
          {...fieldProps(formik, 'signedAt', 'Порожньо, поки не підписано')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Назва"
          {...fieldProps(formik, 'title')}
          placeholder={`Якщо порожньо — «${TITLE_HINT[type]}${number.trim() ? ` № ${number.trim()}` : ''}»`}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={FULL_ROW}
        />
      </FormSection>

      <FormSection title="Скани" hint={contract ? 'Додані файли допишуться до вже наявних' : 'PDF або фото підписаного примірника'} columns={1}>
        <FileDropzone
          label={contract ? 'Перетягніть файли або натисніть, щоб обрати' : 'Перетягніть скан або натисніть, щоб обрати'}
          multiple
          files={formik.values.files}
          onChange={(files) => {
            formik.setFieldValue('files', files);
            formik.setFieldTouched('files', true, false);
          }}
          error={fieldError(formik, 'files')}
        />
      </FormSection>
    </FormDialog>
  );
}
