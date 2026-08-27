import { Alert, Box, Chip, CircularProgress, List, ListItem, ListItemText, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { ClientDocumentsSection } from '../components/ClientDocumentsSection';
import { ClientOrdersSection } from '../components/ClientOrdersSection';
import { ClientProductsSection } from '../components/ClientProductsSection';
import { DocumentList } from '../components/DocumentList';
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
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!client) return null;

  const canModifyOrders = hasPermission(user, 'ORDERS', 'modify');
  const canModifyProducts = hasPermission(user, 'PRODUCTS', 'modify');

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          {client.name}
        </Typography>
        {client.code && <Chip label={client.code} />}
      </Stack>
      {client.contactName && <Typography color="text.secondary">{client.contactName}</Typography>}

      <Typography variant="h6" sx={{ mt: 3 }}>
        Контракти
      </Typography>
      <List component={Paper} sx={{ mb: 3 }}>
        {client.contracts.map((contract) => (
          <ListItem key={contract._id} sx={{ display: 'block' }}>
            <ListItemText primary={contract.title} secondary={contract.status} />
            <Box sx={{ pl: 2 }}>
              <DocumentList documents={contract.documents} dense onError={setError} />
            </Box>
          </ListItem>
        ))}
        {client.contracts.length === 0 && (
          <ListItem>
            <ListItemText primary="Немає контрактів" />
          </ListItem>
        )}
      </List>

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
