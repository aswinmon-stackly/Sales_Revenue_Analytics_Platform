import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
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

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import BusinessCenterTwoToneIcon from '@mui/icons-material/BusinessCenterTwoTone';
import PersonOffTwoToneIcon from '@mui/icons-material/PersonOffTwoTone';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/appLayout';
import { useAuth } from '../../hooks/useAuth';
import { customersService } from '../../services/customersService';
import { getErrorMessage } from '../../services/apiClient';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { StatusBadge } from '../../components/customers/StatusBadge';
import { SegmentBadge } from '../../components/customers/SegmentBadge';
import type { Customer, CustomerInput, CustomerListResponse } from '../../types/customer';

const ROWS_PER_PAGE = 10;

// Shared visual tokens: keep every card / input / button on the same
// radius and shadow scale as CustomerForm and CustomerDetailsPage.
const CARD_SX = {
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
};

// Single source of truth for table typography so headers, primary cells,
// and secondary/meta cells never drift out of sync with each other.
const TABLE_TYPE = {
  header: {
    fontSize: '0.6875rem', // 11px
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'text.secondary',
  },
  primary: {
    fontSize: '0.8125rem', // 13px
    fontWeight: 600,
    color: 'text.primary',
  },
  secondary: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    color: 'text.secondary',
  },
};

interface SortableHeaderProps {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onClick: (field: string) => void;
}

function SortableHeader({ label, field, sortBy, sortOrder, onClick }: SortableHeaderProps) {
  const active = sortBy === field;
  return (
    <Box
      onClick={() => onClick(field)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? 'primary.main' : TABLE_TYPE.header.color,
        transition: 'color 120ms ease',
        '&:hover': { color: 'primary.main' },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: TABLE_TYPE.header.fontSize,
          fontWeight: TABLE_TYPE.header.fontWeight,
          letterSpacing: TABLE_TYPE.header.letterSpacing,
          textTransform: TABLE_TYPE.header.textTransform,
          color: 'inherit',
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
      {active &&
        (sortOrder === 'asc' ? (
          <ArrowUpwardRoundedIcon sx={{ fontSize: 13 }} />
        ) : (
          <ArrowDownwardRoundedIcon sx={{ fontSize: 13 }} />
        ))}
    </Box>
  );
}

// Plain (non-sortable) header label, kept visually identical to SortableHeader
// so every column in the row reads at the same size/weight/spacing.
function ColumnHeader({ label }: { label: string }) {
  return (
    <Typography
      component="span"
      sx={{
        fontSize: TABLE_TYPE.header.fontSize,
        fontWeight: TABLE_TYPE.header.fontWeight,
        letterSpacing: TABLE_TYPE.header.letterSpacing,
        textTransform: TABLE_TYPE.header.textTransform,
        color: TABLE_TYPE.header.color,
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'info' | 'warning';
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  const theme = useTheme();
  const main = theme.palette[color].main;
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 4,
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(main, 0.1),
          color: main,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 0.6, display: 'block' }}
        >
          {label.toUpperCase()}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function CustomersPage() {
  const theme = useTheme();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showKpis, setShowKpis] = useState(true);

  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [statusTarget, setStatusTarget] = useState<Customer | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

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

  const [regionDebounced, setRegionDebounced] = useState('');
  const [countryDebounced, setCountryDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setRegionDebounced(regionFilter);
      setCountryDebounced(countryFilter);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [regionFilter, countryFilter]);

  const fetchCustomers = () => {
    setLoading(true);
    setError(null);
    customersService
      .getCustomers({
        search: search || undefined,
        segment: segmentFilter,
        status: statusFilter,
        region: regionDebounced || undefined,
        country: countryDebounced || undefined,
        page,
        limit: ROWS_PER_PAGE,
        sortBy,
        sortOrder,
      })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCustomers, [search, segmentFilter, statusFilter, regionDebounced, countryDebounced, sortBy, sortOrder, page]);

  const customers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleResetFilters = () => {
    setSearchInput('');
    setSegmentFilter('All');
    setStatusFilter('All');
    setRegionFilter('');
    setCountryFilter('');
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openCreate = () => {
    setFormMode('create');
    setEditingCustomer(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setFormMode('edit');
    setEditingCustomer(customer);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: CustomerInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await customersService.createCustomer(payload);
        setSnackbar({ open: true, message: 'Customer created.', severity: 'success' });
      } else if (editingCustomer) {
        await customersService.updateCustomer(editingCustomer.id, payload);
        setSnackbar({ open: true, message: 'Customer updated.', severity: 'success' });
      }
      setFormOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setStatusSubmitting(true);
    try {
      const nextStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await customersService.setStatus(statusTarget.id, nextStatus);
      setSnackbar({
        open: true,
        message: `Customer ${nextStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'}.`,
        severity: 'success',
      });
      setStatusTarget(null);
      fetchCustomers();
    } catch (err) {
      setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' });
    } finally {
      setStatusSubmitting(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  return (
    <AppLayout title="Customers" subtitle="Manage your customer master data and regional records">
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        {showKpis && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard label="Total Customers" value={data?.total ?? 0} color="primary" icon={<PeopleAltTwoToneIcon />} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Active Accounts"
                value={customers.filter((c) => c.status === 'ACTIVE').length}
                color="success"
                icon={<CheckCircleTwoToneIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Enterprise"
                value={customers.filter((c) => c.segment === 'Enterprise').length}
                color="info"
                icon={<BusinessCenterTwoToneIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Inactive"
                value={customers.filter((c) => c.status === 'INACTIVE').length}
                color="warning"
                icon={<PersonOffTwoToneIcon />}
              />
            </Grid>
          </Grid>
        )}

        {/* Main Content Table Card */}
        <Card variant="outlined" sx={CARD_SX}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              {/* Left */}
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Customer Directory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Showing {customers.length} of {data?.total ?? 0} customers
                </Typography>
              </Stack>

              {/* Right */}
              <Stack direction="row" alignItems="center" spacing={1}>
                {isAdmin && (
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={openCreate}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    Add Customer
                  </Button>
                )}

                <IconButton
                  size="small"
                  onClick={() => setShowKpis((prev) => !prev)}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
                >
                  {showKpis ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                </IconButton>
              </Stack>
            </Stack>

            {/* Filters Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                  <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Filters
                  </Typography>
                </Box>

                <TextField
                  size="small"
                  placeholder="Search name, code, email…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  sx={{
                    minWidth: 220,
                    flexGrow: { xs: 1, sm: 0 },
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Select
                  size="small"
                  value={segmentFilter}
                  onChange={(e) => {
                    setSegmentFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{ minWidth: 148, bgcolor: 'background.paper', borderRadius: 2, fontSize: '0.875rem' }}
                >
                  <MenuItem value="All">All Segments</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="At Risk">At Risk</MenuItem>
                </Select>

                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{ minWidth: 128, bgcolor: 'background.paper', borderRadius: 2, fontSize: '0.875rem' }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>

                <TextField
                  size="small"
                  placeholder="Region"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  sx={{ width: 120, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
                />

                <TextField
                  size="small"
                  placeholder="Country"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  sx={{ width: 120, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
                />

                <Tooltip title="Reset filters">
                  <IconButton onClick={handleResetFilters} size="small" sx={{ ml: 'auto' }}>
                    <RestartAltRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>

            {/* Table Area */}
            <TableContainer sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Table
                sx={{
                  minWidth: 900,
                  borderCollapse: 'separate',
                  // Global cell rhythm: same padding + border color everywhere,
                  // so header and body rows share one consistent grid.
                  '& .MuiTableCell-root': {
                    borderColor: 'divider',
                    px: 2,
                    py: 1.5,
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    transition: 'background-color 120ms ease',
                  },
                }}
              >
                <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.025) }}>
                  <TableRow>
                    <TableCell sx={{ py: 1.25 }}>
                      <ColumnHeader label="Code" />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <SortableHeader label="Customer" field="name" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <ColumnHeader label="Contact" />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <SortableHeader label="Company" field="company" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <ColumnHeader label="Segment" />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <SortableHeader label="Region" field="region" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <ColumnHeader label="Status" />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <SortableHeader label="Created" field="created_at" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.25 }}>
                      <ColumnHeader label="Actions" />
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8, border: 0 }}>
                        <CircularProgress size={26} thickness={4} />
                        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 1.25 }}>
                          Loading customer records…
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={customer.customer_code}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.6875rem',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              letterSpacing: '0.02em',
                              borderRadius: 1.5,
                              height: 22,
                              color: 'text.secondary',
                              borderColor: 'divider',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 12,
                                bgcolor: 'primary.main',
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(customer.name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ ...TABLE_TYPE.primary, lineHeight: 1.4 }} noWrap>
                                {customer.name}
                              </Typography>
                              <Typography sx={{ ...TABLE_TYPE.secondary, lineHeight: 1.4 }}>
                                {customer.customer_code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ ...TABLE_TYPE.primary, fontWeight: 500, lineHeight: 1.4 }} noWrap>
                            {customer.email}
                          </Typography>
                          <Typography sx={{ ...TABLE_TYPE.secondary, lineHeight: 1.4 }}>
                            {customer.phone || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ ...TABLE_TYPE.primary, fontWeight: 500 }}>
                            {customer.company}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <SegmentBadge segment={customer.segment} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ ...TABLE_TYPE.primary, fontWeight: 500 }}>
                            {customer.region || '—'}
                          </Typography>
                          {customer.country && (
                            <Typography sx={{ ...TABLE_TYPE.secondary, display: 'block', mt: 0.25 }}>
                              {customer.country}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={customer.status} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ ...TABLE_TYPE.secondary, fontWeight: 500 }}>
                            {new Date(customer.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                            <Tooltip title="View details">
                              <IconButton size="small" color="primary" onClick={() => navigate(`/customers/${customer.id}`)}>
                                <VisibilityTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {isAdmin && (
                              <>
                                <Tooltip title="Edit customer">
                                  <IconButton size="small" color="info" onClick={() => openEdit(customer)}>
                                    <EditTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={customer.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}>
                                  <IconButton
                                    size="small"
                                    color={customer.status === 'ACTIVE' ? 'error' : 'success'}
                                    onClick={() => setStatusTarget(customer)}
                                  >
                                    <PowerSettingsNewRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8, border: 0 }}>
                        <Box sx={{ maxWidth: 320, mx: 'auto', textAlign: 'center' }}>
                          <PeopleAltTwoToneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            No customers found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No records match your current filters. Try clearing them or adjusting your search.
                          </Typography>
                          <Button size="small" variant="outlined" onClick={handleResetFilters} sx={{ borderRadius: 2, textTransform: 'none' }}>
                            Clear all filters
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer Pagination */}
            {totalPages > 1 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }} flexWrap="wrap" rowGap={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                  size="small"
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Customer Create/Edit Dialog */}
      <CustomerForm
        open={formOpen}
        mode={formMode}
        initialCustomer={editingCustomer}
        submitting={submitting}
        serverError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Toggle Confirmation Dialog */}
      <Dialog open={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm {statusTarget?.status === 'ACTIVE' ? 'deactivation' : 'reactivation'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'reactivate'}{' '}
            <strong>{statusTarget?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setStatusTarget(null)} disabled={statusSubmitting} color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleToggleStatus}
            variant="contained"
            color={statusTarget?.status === 'ACTIVE' ? 'error' : 'success'}
            disabled={statusSubmitting}
            disableElevation
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {statusSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}