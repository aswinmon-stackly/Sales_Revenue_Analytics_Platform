import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { CategoryForm } from '../../components/categories/CategoryForm';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '../../layouts/appLayout';
import { getErrorMessage } from '../../services/apiClient';
import { categoriesService } from '../../services/categoriesService';
import type { Category, CategoryInput, CategoryListResponse } from '../../types/category';

const ROWS_PER_PAGE = 10;

export default function CategoriesPage() {
  const theme = useTheme();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<CategoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    categoriesService
      .getCategories({ search: search || undefined, status: statusFilter, page, limit: ROWS_PER_PAGE })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categories = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const openCreate = () => {
    setFormMode('create');
    setEditingCategory(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setFormMode('edit');
    setEditingCategory(category);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: CategoryInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await categoriesService.createCategory(payload);
        setSnackbar({ open: true, message: 'Category successfully created.', severity: 'success' });
      } else if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, payload);
        setSnackbar({ open: true, message: 'Category details updated.', severity: 'success' });
      }
      setFormOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoriesService.deleteCategory(deleteTarget.id);
      setSnackbar({ open: true, message: 'Category removed successfully.', severity: 'success' });
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout title="Categories" subtitle="Organize and structure your catalog hierarchy">
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 1 }}>
        <Stack spacing={3}>
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.03),
                borderColor: alpha(theme.palette.error.main, 0.2),
              }}
            >
              {error}
            </Alert>
          )}

          {/* Main Content Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: theme.palette.background.paper,
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 10px 20px -5px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
            }}
          >
            {/* Header Toolbar */}
            <Box sx={{ p: { xs: 2.5, sm: 3.5 }, pb: 2.5 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                      }}
                    >
                      <CategoryRoundedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        All Categories
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {data ? `${data.total} total item${data.total === 1 ? '' : 's'} registered` : 'Loading items...'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {isAdmin && (
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddRoundedIcon />}
                    onClick={openCreate}
                    sx={{
                      borderRadius: 2.5,
                      px: 2.5,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                      },
                    }}
                  >
                    Add Category
                  </Button>
                )}
              </Stack>

              {/* Filters and Search Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search categories by name or keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  sx={{
                    maxWidth: { sm: 360 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.common.black, 0.015),
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'background.paper',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListRoundedIcon fontSize="small" sx={{ color: 'text.disabled', ml: 0.5 }} />
                      </InputAdornment>
                    }
                    sx={{
                      minWidth: 150,
                      width: { xs: '100%', sm: 'auto' },
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.common.black, 0.015),
                      '& .MuiSelect-select': {
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      },
                    }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Data Table */}
            <TableContainer sx={{ minHeight: 380 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: alpha(theme.palette.common.black, 0.02) }}>
                  <TableRow>
                    <TableCell sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Category Name
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Products
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Created Date
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right" sx={{ py: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 10 }}>
                        <CircularProgress size={32} thickness={4} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                          Fetching categories...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : categories.length > 0 ? (
                    categories.map((category) => {
                      const isActive = category.status === 'Active';
                      return (
                        <TableRow
                          key={category.id}
                          hover
                          sx={{
                            transition: 'background-color 0.15s ease',
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {category.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280, fontSize: '0.8125rem' }}>
                              {category.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              icon={<Inventory2TwoToneIcon style={{ fontSize: 14 }} />}
                              label={`${category.product_count} product${category.product_count === 1 ? '' : 's'}`}
                              size="small"
                              sx={{
                                borderRadius: 1.5,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                bgcolor: alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'transparent',
                                '& .MuiChip-icon': {
                                  color: 'text.secondary',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={category.status}
                              size="small"
                              sx={{
                                borderRadius: 1.5,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                px: 0.5,
                                bgcolor: isActive ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.text.primary, 0.06),
                                color: isActive ? 'success.main' : 'text.secondary',
                                border: '1px solid',
                                borderColor: isActive ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.text.primary, 0.1),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                              {new Date(category.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Typography>
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <Tooltip title="Edit Category" arrow placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEdit(category)}
                                    sx={{
                                      borderRadius: 1.5,
                                      color: 'text.secondary',
                                      '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                      },
                                    }}
                                  >
                                    <EditTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Category" arrow placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setDeleteError(null);
                                      setDeleteTarget(category);
                                    }}
                                    sx={{
                                      borderRadius: 1.5,
                                      color: 'text.secondary',
                                      '&:hover': {
                                        color: 'error.main',
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                      },
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 8 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            maxWidth: 360,
                            margin: '0 auto',
                            bgcolor: 'transparent',
                            textAlign: 'center',
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.text.primary, 0.04),
                              color: 'text.secondary',
                              width: 56,
                              height: 56,
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <FolderOpenRoundedIcon fontSize="medium" />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            No categories found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchInput || statusFilter !== 'All'
                              ? 'Try adjusting your search criteria or status filter.'
                              : 'Get started by creating your first catalog category.'}
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            {!loading && totalPages > 1 && (
              <>
                <Divider />
                <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    color="primary"
                    shape="rounded"
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Card>
        </Stack>

        {/* Existing Component Forms & Modals */}
        <CategoryForm
          open={formOpen}
          mode={formMode}
          initialCategory={editingCategory}
          submitting={submitting}
          serverError={formError}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                  width: 36,
                  height: 36,
                }}
              >
                <WarningAmberRoundedIcon fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                Delete Category
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {deleteError ? (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                {deleteError}
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ leading: 1.6 }}>
                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone and will affect associated catalog metrics.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              disableElevation
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disableElevation
              onClick={handleDelete}
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            sx={{
              borderRadius: 2.5,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontWeight: 500,
              alignItems: 'center',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AppLayout>
  );
}