import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/appLayout';
import { customersService } from '../../services/customersService';
import { getErrorMessage } from '../../services/apiClient';
import type { Customer, CustomerListResponse, CustomerSummary } from '../../types/customer';

const statusColors: Record<
  Customer['status'],
  'success' | 'default'
> = {
  Active: 'success',
  Inactive: 'default',
};

const ROWS_PER_PAGE = 5;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  const first = parts[0]?.[0] ?? '';
  const last =
    parts.length > 1
      ? parts[parts.length - 1]?.[0] ?? ''
      : '';

  return `${first}${last}`.toUpperCase();
}

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the free-text search so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      try {
        const [list, summaryData] = await Promise.all([
          customersService.getCustomers({
            search: search || undefined,
            status,
            page,
            page_size: ROWS_PER_PAGE,
          }),
          customersService.getCustomerSummary(),
        ]);
        if (!cancelled) {
          setData(list);
          setSummary(summaryData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCustomers();
    return () => {
      cancelled = true;
    };
  }, [search, status, page]);

  const customers = data?.items ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <AppLayout
      title="Customers"
      subtitle="Manage and monitor your customers"
    >
      <Stack spacing={3}>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Customer Statistics */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow:
                  '0 4px 24px rgba(17, 24, 39, 0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Total Customers
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mt: 1 }}
                    >
                      {summary?.total_customers ?? '—'}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    <PeopleAltRoundedIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow:
                  '0 4px 24px rgba(17, 24, 39, 0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Active Customers
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mt: 1 }}
                    >
                      {summary?.active_customers ?? '—'}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.main',
                    }}
                  >
                    <PersonAddAltRoundedIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow:
                  '0 4px 24px rgba(17, 24, 39, 0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      Customer Revenue
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mt: 1 }}
                    >
                      {summary ? formatCurrency(summary.total_revenue) : '—'}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      bgcolor: 'warning.light',
                      color: 'warning.main',
                    }}
                  >
                    <TrendingUpRoundedIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer Table */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              '0 4px 24px rgba(17, 24, 39, 0.05)',
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, md: 3 },
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Customer List
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  View and manage customer information
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
              >
                <TextField
                  size="small"
                  placeholder="Search customers..."
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
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
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="All">
                    All Customers
                  </MenuItem>

                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </Select>
              </Stack>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight={700}>
                        Customer
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Company
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Orders
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Total Spent
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Status
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Joined Date
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : customers.length > 0 ? (
                    customers.map(
                      (customer) => (
                        <TableRow
                          key={customer.id}
                          hover
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                            >
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor:
                                    'primary.main',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {getInitials(
                                  customer.name
                                )}
                              </Avatar>

                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                >
                                  {customer.name}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {customer.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {customer.company}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {customer.orders}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {formatCurrency(
                                customer.total_spent
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={customer.status}
                              size="small"
                              color={
                                statusColors[
                                  customer.status
                                ]
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {customer.joined_date}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Typography
                          color="text.secondary"
                        >
                          No customers found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) =>
                    setPage(value)
                  }
                  color="primary"
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </AppLayout>
  );
}
