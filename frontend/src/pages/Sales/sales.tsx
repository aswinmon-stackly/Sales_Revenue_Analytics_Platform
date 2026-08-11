import {
  Alert,
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
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

import { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/appLayout';
import { salesService } from '../../services/salesService';
import { getErrorMessage } from '../../services/apiClient';
import type { Sale, SaleListResponse } from '../../types/sales';

const statusColors: Record<
  Sale['status'],
  'success' | 'info' | 'warning' | 'error'
> = {
  Completed: 'success',
  Processing: 'info',
  Pending: 'warning',
  Cancelled: 'error',
};

const ROWS_PER_PAGE = 5;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<SaleListResponse | null>(null);
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

    async function fetchSales() {
      setLoading(true);
      setError(null);
      try {
        const response = await salesService.getSales({
          search: search || undefined,
          status,
          category,
          page,
          page_size: ROWS_PER_PAGE,
        });
        if (!cancelled) {
          setData(response);
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

    fetchSales();
    return () => {
      cancelled = true;
    };
  }, [search, status, category, page]);

  const sales = data?.items ?? [];
  const totalSales = data?.total ?? 0;
  const totalRevenue = data?.total_revenue ?? 0;
  const completedOrders = data?.completed_orders ?? 0;
  const totalPages = data?.total_pages ?? 0;

  return (
    <AppLayout
      title="Sales"
      subtitle="Manage and monitor all sales transactions"
    >
      <Stack spacing={3}>

        {/* Summary */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Sales
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ mt: 1 }}
                >
                  {totalSales}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Revenue
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ mt: 1 }}
                >
                  {formatCurrency(totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Completed Orders
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ mt: 1 }}
                >
                  {completedOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sales Table */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              '0 4px 24px rgba(17, 24, 39, 0.05)',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>

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
                  Sales Transactions
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  View and filter recent sales
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
                  placeholder="Search sales..."
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
                  startAdornment={
                    <FilterListRoundedIcon
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                  }
                >
                  <MenuItem value="All">
                    All Status
                  </MenuItem>
                  <MenuItem value="Completed">
                    Completed
                  </MenuItem>
                  <MenuItem value="Processing">
                    Processing
                  </MenuItem>
                  <MenuItem value="Pending">
                    Pending
                  </MenuItem>
                  <MenuItem value="Cancelled">
                    Cancelled
                  </MenuItem>
                </Select>

                <Select
                  size="small"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="All">
                    All Categories
                  </MenuItem>
                  <MenuItem value="Software">
                    Software
                  </MenuItem>
                  <MenuItem value="Electronics">
                    Electronics
                  </MenuItem>
                  <MenuItem value="Services">
                    Services
                  </MenuItem>
                </Select>
              </Stack>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight={700}>
                        Order ID
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Customer
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Product
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Category
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Amount
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Status
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Date
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : sales.length > 0 ? (
                    sales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {sale.id}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {sale.customer}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {sale.product}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={sale.category}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {formatCurrency(sale.amount)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={sale.status}
                            size="small"
                            color={
                              statusColors[sale.status]
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {sale.date}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Typography
                          color="text.secondary"
                        >
                          No sales found
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
