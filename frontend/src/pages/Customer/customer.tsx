
import {
  Avatar,
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
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import { useState } from 'react';
import { AppLayout } from '../../layouts/appLayout';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  orders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

const customersData: Customer[] = [
  {
    id: 'CUS-1001',
    name: 'Arun Kumar',
    email: 'arun.kumar@example.com',
    company: 'Acme Corporation',
    orders: 48,
    totalSpent: 42500,
    status: 'Active',
    joinedDate: '02 Jan 2026',
  },
  {
    id: 'CUS-1002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    company: 'Tech Solutions Ltd',
    orders: 42,
    totalSpent: 38900,
    status: 'Active',
    joinedDate: '15 Jan 2026',
  },
  {
    id: 'CUS-1003',
    name: 'Rahul Raj',
    email: 'rahul.raj@example.com',
    company: 'Global Enterprises',
    orders: 36,
    totalSpent: 32100,
    status: 'Active',
    joinedDate: '28 Jan 2026',
  },
  {
    id: 'CUS-1004',
    name: 'Sneha Devi',
    email: 'sneha.devi@example.com',
    company: 'Prime Industries',
    orders: 31,
    totalSpent: 28750,
    status: 'Inactive',
    joinedDate: '05 Feb 2026',
  },
  {
    id: 'CUS-1005',
    name: 'Vijay Kumar',
    email: 'vijay.kumar@example.com',
    company: 'Digital Works',
    orders: 27,
    totalSpent: 24100,
    status: 'Active',
    joinedDate: '18 Feb 2026',
  },
  {
    id: 'CUS-1006',
    name: 'Karthik S',
    email: 'karthik.s@example.com',
    company: 'Bright Systems',
    orders: 24,
    totalSpent: 19800,
    status: 'Active',
    joinedDate: '01 Mar 2026',
  },
  {
    id: 'CUS-1007',
    name: 'Divya Menon',
    email: 'divya.menon@example.com',
    company: 'Vertex Solutions',
    orders: 21,
    totalSpent: 17500,
    status: 'Inactive',
    joinedDate: '12 Mar 2026',
  },
  {
    id: 'CUS-1008',
    name: 'Suresh Babu',
    email: 'suresh.babu@example.com',
    company: 'NextGen Corp',
    orders: 19,
    totalSpent: 15200,
    status: 'Active',
    joinedDate: '25 Mar 2026',
  },
];

const statusColors: Record<
  Customer['status'],
  'success' | 'default'
> = {
  Active: 'success',
  Inactive: 'default',
};

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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const filteredCustomers = customersData.filter(
    (customer) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        customer.id
          .toLowerCase()
          .includes(searchValue) ||
        customer.name
          .toLowerCase()
          .includes(searchValue) ||
        customer.email
          .toLowerCase()
          .includes(searchValue) ||
        customer.company
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === 'All' ||
        customer.status === status;

      return matchesSearch && matchesStatus;
    }
  );

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalCustomers = customersData.length;

  const activeCustomers = customersData.filter(
    (customer) => customer.status === 'Active'
  ).length;

  const totalRevenue = customersData.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  return (
    <AppLayout
      title="Customers"
      subtitle="Manage and monitor your customers"
    >
      <Stack spacing={3}>

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
                      {totalCustomers}
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
                      {activeCustomers}
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
                      {formatCurrency(totalRevenue)}
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
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map(
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
                                customer.totalSpent
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
                              {customer.joinedDate}
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
            {filteredCustomers.length > 0 && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Pagination
                  count={Math.ceil(
                    filteredCustomers.length /
                      rowsPerPage
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
