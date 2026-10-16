import { Alert, Box, Chip, CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { ClientDocumentsSection } from '../components/ClientDocumentsSection';
import { ClientOrdersSection } from '../components/ClientOrdersSection';
import { ClientPapersSection } from '../components/ClientPapersSection';
import { ClientProductsSection } from '../components/ClientProductsSection';
import { PaperChips } from '../components/PaperChips';
import { RequisitesCard } from '../components/RequisitesCard';
import type { ClientDetail } from '../types/clients';

type TabKey = 'orders' | 'products' | 'documents';

export function ClientDetailPage() {
  const { user } = useAuth();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('orders');

  function loadClient() {
    apiClient
      .get<ClientDetail>(`/clients/${clientId}`)
      .then((res) => setClient(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadClient, [clientId]);

  if (loading) return <CircularProgress />;
  if (!client) return error ? <Alert severity="error">{error}</Alert> : null;

  const canModifyOrders = hasPermission(user, 'ORDERS', 'modify');
  const canModifyProducts = hasPermission(user, 'PRODUCTS', 'modify');

  return (
    <>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="h4" sx={{ mb: 0 }}>
            {client.name}
          </Typography>
          {client.code && <Chip label={client.code} />}
          {client.status === 'deleted' && <Chip color="error" label="Видалено" />}
        </Stack>
        {(client.legalName || client.contactName) && (
          <Typography color="text.secondary">{[client.legalName, client.contactName].filter(Boolean).join(' · ')}</Typography>
        )}
        <PaperChips papers={client.papers} />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3} sx={{ mb: 4 }}>
        <ClientPapersSection clientId={client._id} contracts={client.contracts} canModify={canModifyOrders} onChanged={loadClient} />
        <Box sx={{ maxWidth: 760 }}>
          <RequisitesCard client={client} canModify={canModifyOrders} onSaved={loadClient} />
        </Box>
      </Stack>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab value="orders" label="Замовлення" />
        <Tab value="products" label="Продукти" />
        <Tab value="documents" label="Документи" />
      </Tabs>

      {tab === 'orders' && (
        <ClientOrdersSection
          clientId={client._id}
          canModify={canModifyOrders}
          documentPool={client.documents}
          onRefreshClient={loadClient}
        />
      )}
      {tab === 'products' && <ClientProductsSection clientId={client._id} canModify={canModifyProducts} />}
      {tab === 'documents' && (
        <ClientDocumentsSection
          clientId={client._id}
          documents={client.documents}
          canModify={canModifyOrders}
          onRefreshClient={loadClient}
        />
      )}
    </>
  );
}
