import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { AppLayout } from '../../layouts/appLayout';
import { useAuth } from '../../hooks/useAuth';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { getErrorMessage } from '../../services/apiClient';
import { ProductForm } from '../../components/products/ProductForm';
import type { Category } from '../../types/category';
import type { Product, ProductInput, ProductListResponse } from '../../types/product';

const ROWS_PER_PAGE = 10;

type SortField = 'name' | 'sku' | 'price' | 'stock_quantity' | 'created_at';

function stockChipColor(status: Product['stock_status']): 'success' | 'warning' | 'error' {
  if (status === 'In Stock') return 'success';
  if (status === 'Low Stock') return 'warning';
  return 'error';
}

function statusChipColor(status: Product['status']): 'success' | 'default' | 'error' {
  if (status === 'Active') return 'success';
  if (status === 'Discontinued') return 'error';
  return 'default';
}

export default function ProductsPage() {
  const theme = useTheme();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load categories once, for both the filter dropdown and the form
  useEffect(() => {
    categoriesService
      .getAllForDropdown()
      .then(setCategories)
      .catch(() => {
        // Non-fatal: filter/form will just show an empty category list
      });
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    productsService
      .getProducts({
        search: search || undefined,
        category: categoryFilter !== 'All' ? Number(categoryFilter) : undefined,
        status: statusFilter,
        stockStatus: stockStatusFilter,
        page,
        limit: ROWS_PER_PAGE,
        sortBy,
        sortOrder,
      })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, [search, categoryFilter, statusFilter, stockStatusFilter, page, sortBy, sortOrder]);

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const openCreate = () => {
    setFormMode('create');
    setEditingProduct(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setFormMode('edit');
    setEditingProduct(product);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: ProductInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await productsService.createProduct(payload);
        setSnackbar({ open: true, message: 'Product created.', severity: 'success' });
      } else if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, payload);
        setSnackbar({ open: true, message: 'Product updated.', severity: 'success' });
      }
      setFormOpen(false);
      fetchProducts();
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
      await productsService.deleteProduct(deleteTarget.id);
      setSnackbar({ open: true, message: 'Product deleted.', severity: 'success' });
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const colSpan = isAdmin ? 8 : 7;

  return (
    <AppLayout title="Products" subtitle="Manage your product catalog, pricing, and stock levels">
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(17, 24, 39, 0.05)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data ? `${data.total} product${data.total === 1 ? '' : 's'}` : 'Loading…'}
                </Typography>
              </Box>

              {isAdmin && (
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}
                  sx={{
                    borderRadius: 2.5,
                    px: 2,
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
                  }}>
                  Add Product
                </Button>
              )}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search name or SKU..."
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
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Select
                size="small"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
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
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
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
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Discontinued">Discontinued</MenuItem>
              </Select>

              <Select
                size="small"
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value);
                  setPage(1);
                }}
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
                <MenuItem value="All">All Stock</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sortDirection={sortBy === 'name' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortBy === 'sku' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'sku'}
                        direction={sortBy === 'sku' ? sortOrder : 'asc'}
                        onClick={() => handleSort('sku')}
                      >
                        SKU
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right" sortDirection={sortBy === 'price' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'price'}
                        direction={sortBy === 'price' ? sortOrder : 'asc'}
                        onClick={() => handleSort('price')}
                      >
                        Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sortBy === 'stock_quantity' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'stock_quantity'}
                        direction={sortBy === 'stock_quantity' ? sortOrder : 'asc'}
                        onClick={() => handleSort('stock_quantity')}
                      >
                        Stock
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell sortDirection={sortBy === 'created_at' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'created_at'}
                        direction={sortBy === 'created_at' ? sortOrder : 'asc'}
                        onClick={() => handleSort('created_at')}
                      >
                        Created
                      </TableSortLabel>
                    </TableCell>
                    {isAdmin && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{product.category_name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end" spacing={0.5}>
                            <Typography variant="body2">{product.stock_quantity}</Typography>
                            <Chip
                              label={product.stock_status}
                              size="small"
                              color={stockChipColor(product.stock_status)}
                              variant="outlined"
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            size="small"
                            color={statusChipColor(product.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(product.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                        {isAdmin && (
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => openEdit(product)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteTarget(product);
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No products found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!loading && totalPages > 1 && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      <ProductForm
        open={formOpen}
        mode={formMode}
        initialProduct={editingProduct}
        categories={categories}
        submitting={submitting}
        serverError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Alert severity="error">{deleteError}</Alert>
          ) : (
            <Typography variant="body2">
              This will permanently delete <strong>{deleteTarget?.name}</strong>. This cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}