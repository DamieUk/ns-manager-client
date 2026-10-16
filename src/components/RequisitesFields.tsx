import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, TextField, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { REQUISITE_FIELDS } from '../constants/documents';
import type { ClientRequisites } from '../types/clients';

interface RequisitesFieldsProps {
  values: Required<ClientRequisites>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  defaultExpanded?: boolean;
}

// Collapsible block of the client's requisites — needed later for generated invoices and
// delivery notes, so it can stay empty at first.
export function RequisitesFields({ values, onChange, defaultExpanded = false }: RequisitesFieldsProps) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack>
          <Typography sx={{ fontWeight: 700 }}>Реквізити для документів</Typography>
          <Typography variant="caption" color="text.secondary">
            Для рахунків і видаткових накладних — можна заповнити пізніше
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {REQUISITE_FIELDS.map((f) => (
            <TextField
              key={f.name}
              name={f.name}
              label={f.label}
              placeholder={'placeholder' in f ? f.placeholder : undefined}
              value={values[f.name]}
              onChange={onChange}
              multiline={f.name === 'legalAddress'}
              fullWidth
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
