import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import type { Category, CategoryInput, CategoryStatus } from '../../types/category';

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

const EMPTY_FORM: FormState = { name: '', description: '', status: 'Active' };

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
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialCategory));
      setErrors({});
    }
  }, [open, initialCategory]);

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Category name is required';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Category' : 'Edit Category'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            multiline
            minRows={2}
            fullWidth
          />

          <Select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CategoryStatus }))}
            fullWidth
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {mode === 'create' ? 'Create Category' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}