import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { getErrorMessage } from '../api/errors';
import type { Product } from '../types/orders';
import { DocumentList } from './DocumentList';
import { ProductForm, type ProductFormValues } from './ProductForm';

interface ClientProductsSectionProps {
  clientId: string;
  canModify: boolean;
}

export function ClientProductsSection({ clientId, canModify }: ClientProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function loadProducts() {
    setLoading(true);
    apiClient
      .get<Product[]>('/products', { params: { client: clientId } })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, [clientId]);

  async function handleCreate(values: ProductFormValues) {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('client', clientId);
    formData.append('name', values.name);
    formData.append('sku', values.sku);
    formData.append('type', values.type);
    if (values.description) formData.append('description', values.description);
    if (values.bomFile) formData.append('bomFile', values.bomFile);
    values.additionalFiles.forEach((file) => formData.append('additionalFiles', file));

    try {
      await apiClient.post('/products', formData);
      setFormOpen(false);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/products/${deleteTargetId}`);
      setDeleteTargetId(null);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <CircularProgress size={24} />;

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Продукти</Typography>
        {canModify && (
          <Button size="small" variant="contained" onClick={() => setFormOpen(true)}>
            Новий продукт
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 && <Typography color="text.secondary">Немає продуктів</Typography>}

      {products.map((product) => (
        <Accordion key={product._id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
              <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
              <Chip size="small" label={product.type} />
              <Chip size="small" variant="outlined" label={product.sku} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {product.description && <Typography sx={{ mb: 2 }}>{product.description}</Typography>}

            {product.type === 'PCB' && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  BOM файл
                </Typography>
                <DocumentList documents={product.bomFile ? [product.bomFile] : []} onError={setError} />
              </>
            )}

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Додаткові файли
            </Typography>
            <DocumentList documents={product.additionalFiles} onError={setError} />

            {canModify && (
              <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
                <IconButton size="small" onClick={() => setDeleteTargetId(product._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogTitle>Новий продукт</DialogTitle>
        <DialogContent>
          <ProductForm submitting={submitting} onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Видалити продукт?</DialogTitle>
        <DialogContent>Цю дію неможливо скасувати.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Скасувати</Button>
          <Button color="error" onClick={handleDelete}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
