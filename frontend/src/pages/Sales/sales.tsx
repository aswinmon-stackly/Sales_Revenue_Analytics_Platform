
import {
  Box,
  Card,
  CardContent,
  Chip,
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

import { useState } from 'react';
import { AppLayout } from '../../layouts/appLayout';

interface Sale {
  id: string;
  customer: string;
  product: string;
  category: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled';
  date: string;
}

const salesData: Sale[] = [
  {
    id: 'ORD-1001',
    customer: 'Acme Corporation',
    product: 'Enterprise Software',
    category: 'Software',
    amount: 42500,
    status: 'Completed',
    date: '11 Aug 2026',
  },
  {
    id: 'ORD-1002',
    customer: 'Tech Solutions Ltd',
    product: 'Analytics Platform',
    category: 'Software',
    amount: 28900,
    status: 'Processing',
    date: '10 Aug 2026',
  },
  {
    id: 'ORD-1003',
    customer: 'Global Enterprises',
    product: 'Laptop Pro',
    category: 'Electronics',
    amount: 35200,
    status: 'Completed',
    date: '09 Aug 2026',
  },
  {
    id: 'ORD-1004',
    customer: 'Prime Industries',
    product: 'Cloud Services',
    category: 'Services',
    amount: 19750,
    status: 'Pending',
    date: '08 Aug 2026',
  },
  {
    id: 'ORD-1005',
    customer: 'Digital Works',
    product: 'Developer Tools',
    category: 'Software',
    amount: 24100,
    status: 'Completed',
    date: '07 Aug 2026',
  },
  {
    id: 'ORD-1006',
    customer: 'Bright Systems',
    product: 'Wireless Devices',
    category: 'Electronics',
    amount: 15800,
    status: 'Cancelled',
    date: '06 Aug 2026',
  },
  {
    id: 'ORD-1007',
    customer: 'Vertex Solutions',
    product: 'CRM Subscription',
    category: 'Software',
    amount: 31200,
    status: 'Completed',
    date: '05 Aug 2026',
  },
  {
    id: 'ORD-1008',
    customer: 'NextGen Corp',
    product: 'Consulting Services',
    category: 'Services',
    amount: 27500,
    status: 'Processing',
    date: '04 Aug 2026',
  },
];

const statusColors: Record<
  Sale['status'],
  'success' | 'info' | 'warning' | 'error'
> = {
  Completed: 'success',
  Processing: 'info',
  Pending: 'warning',
  Cancelled: 'error',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer.toLowerCase().includes(search.toLowerCase()) ||
      sale.product.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === 'All' || sale.status === status;

    const matchesCategory =
      category === 'All' || sale.category === category;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });

  const paginatedSales = filteredSales.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + sale.amount,
    0
  );

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
                  {filteredSales.length}
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
                  {
                    filteredSales.filter(
                      (sale) => sale.status === 'Completed'
                    ).length
                  }
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
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
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
                  {paginatedSales.length > 0 ? (
                    paginatedSales.map((sale) => (
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
            {filteredSales.length > 0 && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Pagination
                  count={Math.ceil(
                    filteredSales.length / rowsPerPage
                  )}
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

