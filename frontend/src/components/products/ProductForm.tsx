import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { Category } from '../../types/category';
import type { Product, ProductInput, ProductStatus } from '../../types/product';

interface ProductFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialProduct?: Product | null;
  categories: Category[];
  submitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (payload: ProductInput) => void;
}

interface FormState {
  name: string;
  sku: string;
  description: string;
  category_id: string; // string in form state so an empty Select is representable
  price: string;
  cost: string;
  stock_quantity: string;
  status: ProductStatus;
}

const EMPTY_FORM: FormState = {
  name: '',
  sku: '',
  description: '',
  category_id: '',
  price: '',
  cost: '',
  stock_quantity: '',
  status: 'Active',
};

function toFormState(product?: Product | null): FormState {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    category_id: String(product.category_id),
    price: String(product.price),
    cost: String(product.cost),
    stock_quantity: String(product.stock_quantity),
    status: product.status,
  };
}

export function ProductForm({
  open,
  mode,
  initialProduct,
  categories,
  submitting,
  serverError,
  onClose,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialProduct));
      setErrors({});
    }
  }, [open, initialProduct]);

  const update = (patch: Partial<FormState>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  };

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) next.name = 'Product name is required';

    if (!form.sku.trim() || form.sku.trim().length < 3) {
      next.sku = 'SKU must be at least 3 characters';
    } else if (!/^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,30}[A-Za-z0-9])?$/.test(form.sku.trim())) {
      next.sku = 'SKU may only contain letters, numbers, hyphens, underscores';
    }

    if (!form.category_id) next.category_id = 'Category is required';

    const price = Number(form.price);
    if (form.price === '' || Number.isNaN(price) || price <= 0) {
      next.price = 'Price must be greater than 0';
    }

    const cost = Number(form.cost);
    if (form.cost === '' || Number.isNaN(cost) || cost < 0) {
      next.cost = 'Cost must be 0 or greater';
    } else if (!next.price && cost > price) {
      next.cost = 'Cost should not exceed price';
    }

    const stock = Number(form.stock_quantity);
    if (form.stock_quantity === '' || !Number.isInteger(stock) || stock < 0) {
      next.stock_quantity = 'Stock quantity must be a whole number ≥ 0';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      description: form.description.trim() || null,
      category_id: Number(form.category_id),
      price: Number(form.price),
      cost: Number(form.cost),
      stock_quantity: Number(form.stock_quantity),
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Product' : 'Edit Product'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            label="Product Name"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(e) => update({ sku: e.target.value })}
                error={!!errors.sku}
                helperText={errors.sku ?? 'e.g. ELEC-LAPTOP-001'}
                fullWidth
              />
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Select
                value={form.category_id}
                onChange={(e) => update({ category_id: e.target.value })}
                error={!!errors.category_id}
                fullWidth
                size="medium"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a category
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <Typography variant="caption" color="error">
                  {errors.category_id}
                </Typography>
              )}
            </Grid>
          </Grid>

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            multiline
            minRows={2}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid size={4}>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
              />
            </Grid>

            <Grid size={4}>
              <TextField
                label="Cost"
                type="number"
                value={form.cost}
                onChange={(e) => update({ cost: e.target.value })}
                error={!!errors.cost}
                helperText={errors.cost}
                fullWidth
              />
            </Grid>

            <Grid size={4}>
              <TextField
                label="Stock Quantity"
                type="number"
                value={form.stock_quantity}
                onChange={(e) => update({ stock_quantity: e.target.value })}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity}
                fullWidth
              />
            </Grid>
          </Grid>

          <Select
            value={form.status}
            onChange={(e) => update({ status: e.target.value as ProductStatus })}
            fullWidth
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Discontinued">Discontinued</MenuItem>
          </Select>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}