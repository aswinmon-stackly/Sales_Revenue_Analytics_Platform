
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
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import type {
  Category,
  CategoryInput,
  CategoryStatus,
} from '../../types/category';

interface CategoryFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialCategory?: Category | null;
  submitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (payload: CategoryInput) => void;
}

interface FormState {
  name: string;
  description: string;
  status: CategoryStatus;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  status: 'Active',
};

function toFormState(category?: Category | null): FormState {
  if (!category) return EMPTY_FORM;

  return {
    name: category.name,
    description: category.description ?? '',
    status: category.status,
  };
}

export function CategoryForm({
  open,
  mode,
  initialCategory,
  submitting,
  serverError,
  onClose,
  onSubmit,
}: CategoryFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialCategory));
      setErrors({});
    }
  }, [open, initialCategory]);

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) {
      next.name = 'Category name is required';
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
    });
  };

  const isEdit = mode === 'edit';

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
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
          pt: 3,
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
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <CategoryOutlinedIcon />
          </Box>

          <Box>
            <DialogTitle
              sx={{
                p: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {isEdit ? 'Edit Category' : 'Add Category'}
            </DialogTitle>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.4 }}
            >
              {isEdit
                ? 'Update the category details below.'
                : 'Create a new category for your products.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>
          {serverError && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                },
              }}
            >
              {serverError}
            </Alert>
          )}

          {/* Category Name */}
          <TextField
            label="Category Name"
            placeholder="e.g. Electronics"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({
                ...p,
                name: e.target.value,
              }));

              if (errors.name) {
                setErrors((p) => ({
                  ...p,
                  name: undefined,
                }));
              }
            }}
            error={Boolean(errors.name)}
            helperText={errors.name || 'Enter a unique category name'}
            fullWidth
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            placeholder="Add a short description..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                description: e.target.value,
              }))
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

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>

            <Select
              value={form.status}
              label="Status"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as CategoryStatus,
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
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.25)',
            },
          }}
        >
          {submitting
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save Changes'
              : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}