
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

import type { Category } from '../../types/category';
import type {
  Product,
  ProductInput,
  ProductStatus,
} from '../../types/product';

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
  category_id: string;
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

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialProduct));
      setErrors({});
    }
  }, [open, initialProduct]);

  const update = (patch: Partial<FormState>) => {
    setForm((previous) => ({
      ...previous,
      ...patch,
    }));
  };

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) {
      next.name = 'Product name is required';
    }

    if (!form.sku.trim() || form.sku.trim().length < 3) {
      next.sku = 'SKU must be at least 3 characters';
    } else if (
      !/^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,30}[A-Za-z0-9])?$/.test(
        form.sku.trim()
      )
    ) {
      next.sku =
        'SKU may only contain letters, numbers, hyphens, underscores';
    }

    if (!form.category_id) {
      next.category_id = 'Category is required';
    }

    const price = Number(form.price);

    if (
      form.price === '' ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      next.price = 'Price must be greater than 0';
    }

    const cost = Number(form.cost);

    if (
      form.cost === '' ||
      Number.isNaN(cost) ||
      cost < 0
    ) {
      next.cost = 'Cost must be 0 or greater';
    } else if (!next.price && cost > price) {
      next.cost = 'Cost should not exceed price';
    }

    const stock = Number(form.stock_quantity);

    if (
      form.stock_quantity === '' ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      next.stock_quantity =
        'Stock quantity must be a whole number ≥ 0';
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

  const isEdit = mode === 'edit';

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
        },
      }}
    >
      {/* Header */}

      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(180deg, rgba(25,118,210,0.06) 0%, rgba(255,255,255,0) 100%)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <AddBoxOutlinedIcon />
          </Box>

          <Box>
            <DialogTitle
              sx={{
                p: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              {isEdit ? 'Edit Product' : 'Add Product'}
            </DialogTitle>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {isEdit
                ? 'Update the product details below.'
                : 'Create a new product for your catalog.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          px: 3,
          py: 3,
        }}
      >
        <Stack spacing={2.5}>
          {serverError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                borderRadius: 2,
              }}
            >
              {serverError}
            </Alert>
          )}

          {/* Product Name */}
          <TextField
            label="Product Name"
            placeholder="e.g. MacBook Pro 16"
            value={form.name}
            onChange={(e) =>
              update({
                name: e.target.value,
              })
            }
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* SKU + Category */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SKU"
                placeholder="ELEC-LAPTOP-001"
                value={form.sku}
                onChange={(e) =>
                  update({
                    sku: e.target.value,
                  })
                }
                error={Boolean(errors.sku)}
                helperText={
                  errors.sku ||
                  'e.g. ELEC-LAPTOP-001'
                }
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                error={Boolean(errors.category_id)}
              >
                <InputLabel>Category</InputLabel>

                <Select
                  value={form.category_id}
                  label="Category"
                  onChange={(e) =>
                    update({
                      category_id: e.target.value,
                    })
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select a category
                  </MenuItem>

                  {categories.map((category) => (
                    <MenuItem
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>

                {errors.category_id && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{
                      mt: 0.5,
                      ml: 1.5,
                    }}
                  >
                    {errors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Description */}
          <TextField
            label="Description"
            placeholder="Add a short description..."
            value={form.description}
            onChange={(e) =>
              update({
                description: e.target.value,
              })
            }
            multiline
            minRows={3}
            fullWidth
            helperText="Optional"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                alignItems: 'flex-start',
              },
            }}
          />

          {/* Pricing & Inventory */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                mb: 1.5,
                color: 'text.primary',
              }}
            >
              Pricing & Inventory
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    update({
                      price: e.target.value,
                    })
                  }
                  error={Boolean(errors.price)}
                  helperText={errors.price}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Cost"
                  type="number"
                  placeholder="0.00"
                  value={form.cost}
                  onChange={(e) =>
                    update({
                      cost: e.target.value,
                    })
                  }
                  error={Boolean(errors.cost)}
                  helperText={errors.cost}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Stock Quantity"
                  type="number"
                  placeholder="0"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    update({
                      stock_quantity: e.target.value,
                    })
                  }
                  error={Boolean(errors.stock_quantity)}
                  helperText={errors.stock_quantity}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>

            <Select
              value={form.status}
              label="Status"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as ProductStatus,
                }))
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="Active">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                    }}
                  />
                  <Typography>Active</Typography>
                </Stack>
              </MenuItem>

              <MenuItem value="Inactive">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'text.disabled',
                    }}
                  />
                  <Typography>Inactive</Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            minWidth: 140,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow:
                '0 6px 16px rgba(25, 118, 210, 0.25)',
            },
          }}
        >
          {submitting
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save Changes'
              : 'Create Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}