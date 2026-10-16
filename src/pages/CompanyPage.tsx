import { Alert, Box, Button, CircularProgress, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { FormSection } from '../components/form/FormSection';
import { FULL_ROW } from '../components/form/grid';
import type { Company } from '../types/finance';
import { fieldProps, REQUIRED } from '../utils/formik';
import { formatDateTime } from '../utils/format';

type CompanyValues = Omit<Company, 'updatedAt'>;

function withoutStamp(c: Company): CompanyValues {
  const values: Partial<Company> = { ...c };
  delete values.updatedAt;
  return values as CompanyValues;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\s+/g, '');

function validate(v: CompanyValues): Partial<Record<keyof CompanyValues, string>> {
  const errors: Partial<Record<keyof CompanyValues, string>> = {};
  if (!v.name.trim()) errors.name = REQUIRED;
  if (v.edrpou && !/^(\d{8}|\d{10})$/.test(digits(v.edrpou))) errors.edrpou = '8 цифр (ФОП — 10)';
  if (v.iban && !/^UA\d{27}$/.test(digits(v.iban).toUpperCase())) errors.iban = 'UA і 27 цифр';
  if (v.bankMfo && !/^\d{6}$/.test(digits(v.bankMfo))) errors.bankMfo = '6 цифр';
  if (v.bankEdrpou && !/^\d{8}$/.test(digits(v.bankEdrpou))) errors.bankEdrpou = '8 цифр';
  if (v.vatPayer && !v.vatNumber.trim()) errors.vatNumber = 'Потрібен платнику ПДВ';
  else if (v.vatNumber && !/^\d{10,12}$/.test(digits(v.vatNumber))) errors.vatNumber = '10–12 цифр';
  if (v.email && !EMAIL_PATTERN.test(v.email.trim())) errors.email = 'Некоректний email';
  return errors;
}

// Our requisites: printed as the supplier on every invoice and delivery note.
export function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Company>('/company')
      .then((res) => setCompany(res.data))
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, []);

  if (!company) return loadError ? <Alert severity="error">{loadError}</Alert> : <CircularProgress />;
  return <CompanyForm company={company} onSaved={setCompany} />;
}

function CompanyForm({ company, onSaved }: { company: Company; onSaved: (c: Company) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const formik = useFormik<CompanyValues>({
    initialValues: withoutStamp(company),
    validate,
    onSubmit: async (v) => {
      setError(null);
      setSaved(false);
      try {
        const res = await apiClient.put<Company>('/company', v);
        onSaved(res.data);
        formik.resetForm({ values: withoutStamp(res.data) });
        setSaved(true);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Компанія
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Наші реквізити: ідуть у рахунки та видаткові накладні як «Постачальник».
      </Typography>

      <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: 3, maxWidth: 920 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {saved && (
            <Alert severity="success" onClose={() => setSaved(false)}>
              Збережено
            </Alert>
          )}

          <FormSection title="Компанія">
            <TextField label="Коротка назва" {...fieldProps(formik, 'name', 'У шапці документів і в порталі')} required />
            <TextField label="ЄДРПОУ / ІПН" {...fieldProps(formik, 'edrpou')} placeholder="8 цифр (ФОП — 10)" />
            <TextField label="Повна юридична назва" {...fieldProps(formik, 'legalName')} placeholder='ТОВ "…"' sx={FULL_ROW} />
            <TextField label="Юридична адреса" {...fieldProps(formik, 'legalAddress')} multiline sx={FULL_ROW} />
          </FormSection>

          <FormSection title="Банк" columns={3}>
            <TextField label="IBAN" {...fieldProps(formik, 'iban')} placeholder="UA…" sx={FULL_ROW} />
            <TextField label="Банк" {...fieldProps(formik, 'bankName')} />
            <TextField label="МФО" {...fieldProps(formik, 'bankMfo')} />
            <TextField label="ЄДРПОУ банку" {...fieldProps(formik, 'bankEdrpou')} />
          </FormSection>

          <FormSection title="Податки">
            <FormControlLabel
              control={<Switch checked={formik.values.vatPayer} onChange={(e) => formik.setFieldValue('vatPayer', e.target.checked)} />}
              label="Платник ПДВ (20%)"
            />
            <TextField
              label="ІПН платника ПДВ"
              {...fieldProps(formik, 'vatNumber')}
              disabled={!formik.values.vatPayer}
              required={formik.values.vatPayer}
            />
            <TextField
              label="Податковий статус"
              {...fieldProps(formik, 'taxNote', 'Необов’язково, напр. для платника єдиного податку')}
              sx={FULL_ROW}
            />
          </FormSection>

          <FormSection title="Підпис і контакти" columns={3}>
            <TextField label="Виписав" {...fieldProps(formik, 'signatory', 'Прізвище та ініціали під документами')} placeholder="Полтавський Д.О." />
            <TextField label="Телефон" {...fieldProps(formik, 'phone')} />
            <TextField label="Email" {...fieldProps(formik, 'email')} />
          </FormSection>

          <Typography variant="caption" color="text.secondary">
            Ставка ПДВ фіксується в рахунку під час виставлення: зміна тут не чіпає вже виставлені рахунки.
          </Typography>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(company.updatedAt).getTime() > 0 ? `Оновлено ${formatDateTime(company.updatedAt)}` : ''}
              </Typography>
            </Box>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting || !formik.dirty} sx={{ minWidth: 128 }}>
              {formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Зберегти'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}
