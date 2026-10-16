import { TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import type { ClientInput } from '../types/clients';
import { fieldProps } from '../utils/formik';
import { FormSection } from './form/FormSection';
import { FULL_ROW } from './form/grid';

type Contact = Pick<ClientInput, 'contactName' | 'email' | 'phone' | 'address' | 'notes'>;

export function ClientContactSection<T extends Contact>({ formik }: { formik: FormikProps<T> }) {
  const f = formik as unknown as FormikProps<Contact>;
  return (
    <FormSection title="Контакти">
      <TextField label="Контактна особа" {...fieldProps(f, 'contactName')} />
      <TextField label="Телефон" {...fieldProps(f, 'phone')} />
      <TextField label="Email" {...fieldProps(f, 'email')} />
      <TextField label="Адреса" {...fieldProps(f, 'address', 'Куди відправляємо плати')} />
      <TextField label="Нотатки" {...fieldProps(f, 'notes')} multiline minRows={2} sx={FULL_ROW} />
    </FormSection>
  );
}
