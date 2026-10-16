import { TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import type { ClientRequisites } from '../types/clients';
import { fieldProps } from '../utils/formik';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

// The client's requisites, as the recipient on invoices and delivery notes.
export function RequisitesSection<T extends Required<ClientRequisites>>({ formik, hint }: { formik: FormikProps<T>; hint?: string }) {
  const f = formik as unknown as FormikProps<Required<ClientRequisites>>;
  return (
    <FormSection title="Реквізити для документів" hint={hint ?? 'Отримувач у рахунках і видаткових накладних'}>
      <TextField label="Повна юридична назва" {...fieldProps(f, 'legalName')} placeholder='ТОВ "…"' sx={FULL_ROW} />
      <TextField label="ЄДРПОУ / ІПН" {...fieldProps(f, 'edrpou')} placeholder="8 цифр (ФОП — 10)" />
      <TextField label="ІПН платника ПДВ" {...fieldProps(f, 'vatNumber', 'Якщо клієнт — платник ПДВ')} />
      <TextField label="IBAN" {...fieldProps(f, 'iban')} placeholder="UA…" />
      <TextField label="Банк" {...fieldProps(f, 'bankName')} placeholder='АТ КБ «ПриватБанк»' />
      <TextField label="Юридична адреса" {...fieldProps(f, 'legalAddress')} multiline sx={FULL_ROW} />
      <TextField label="Підписант" {...fieldProps(f, 'signatory')} placeholder="Директор Іваненко І. І." />
    </FormSection>
  );
}
