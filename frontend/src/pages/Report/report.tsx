
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { AppLayout } from '../../layouts/appLayout';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'warning.main',
  Processing: 'info.main',
  Completed: 'success.main',
  Cancelled: 'error.main',
};

const statusData = [
  {
    status: 'Completed',
    count: 480,
  },
  {
    status: 'Processing',
    count: 180,
  },
  {
    status: 'Pending',
    count: 120,
  },
  {
    status: 'Cancelled',
    count: 70,
  },
];

const categoryData = [
  {
    category: 'Electronics',
    sales: 185000,
    orders: 245,
  },
  {
    category: 'Software',
    sales: 142000,
    orders: 180,
  },
  {
    category: 'Accessories',
    sales: 98000,
    orders: 150,
  },
  {
    category: 'Services',
    sales: 76000,
    orders: 95,
  },
];

const customerData = [
  {
    name: 'Acme Corporation',
    orders: 48,
    spending: 42500,
  },
  {
    name: 'Tech Solutions Ltd',
    orders: 42,
    spending: 38900,
  },
  {
    name: 'Global Enterprises',
    orders: 36,
    spending: 32100,
  },
  {
    name: 'Prime Industries',
    orders: 31,
    spending: 28750,
  },
  {
    name: 'Digital Works',
    orders: 27,
    spending: 24100,
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
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

function StatusRing({
  label,
  percent,
  count,
}: {
  label: string;
  percent: number;
  count: number;
}) {
  return (
    <Stack
      alignItems="center"
      spacing={1}
      sx={{
        flex: 1,
        minWidth: 96,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={72}
          thickness={4}
          sx={{
            color: 'action.hover',
            position: 'absolute',
          }}
        />

        <CircularProgress
          variant="determinate"
          value={percent}
          size={72}
          thickness={4}
          sx={{
            color: STATUS_COLORS[label] ?? 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
          >
            {Math.round(percent)}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
        >
          {label}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {formatNumber(count)} orders
        </Typography>
      </Box>
    </Stack>
  );
}

export default function ReportsPage() {
  const totalOrders = statusData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const currentRevenue = 501000;
  const previousRevenue = 468000;

  const growthPercent =
    ((currentRevenue - previousRevenue) /
      previousRevenue) *
    100;

  const isGrowthPositive = growthPercent >= 0;

  const maxCategoryValue = Math.max(
    ...categoryData.map((item) => item.sales)
  );

  return (
    <AppLayout
      title="Reports"
      subtitle="Sales performance at a glance"
    >
      <Grid container spacing={2.5}>

        {/* Order Status */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: '100%',
              boxShadow:
                '0 4px 24px rgba(17, 24, 39, 0.05)',
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
              >
                Orders
              </Typography>

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2.5 }}
              >
                Status Breakdown
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
              >
                {statusData.map((item) => {
                  const percent =
                    (item.count / totalOrders) * 100;

                  return (
                    <StatusRing
                      key={item.status}
                      label={item.status}
                      percent={percent}
                      count={item.count}
                    />
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack
            spacing={2.5}
            sx={{ height: '100%' }}
          >
            <Card
              sx={{
                borderRadius: 4,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow:
                  '0 8px 28px rgba(0,0,0,0.12)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.8,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      REVENUE THIS MONTH
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mt: 1 }}
                    >
                      {formatCurrency(currentRevenue)}
                    </Typography>
                  </Box>

                  <Chip
                    label="August 2026"
                    size="small"
                    sx={{
                      bgcolor:
                        'rgba(255,255,255,0.18)',
                      color: 'inherit',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card
              sx={{
                borderRadius: 4,
                flex: 1,
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
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="text.secondary"
                  >
                    Month-over-month
                  </Typography>

                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isGrowthPositive
                        ? 'success.light'
                        : 'error.light',
                      color: isGrowthPositive
                        ? 'success.dark'
                        : 'error.dark',
                    }}
                  >
                    {isGrowthPositive ? (
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    )}
                  </Box>
                </Stack>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ mt: 1.5 }}
                  color={
                    isGrowthPositive
                      ? 'success.main'
                      : 'error.main'
                  }
                >
                  {isGrowthPositive ? '+' : ''}
                  {growthPercent.toFixed(1)}%
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  vs July 2026
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Revenue By Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: '100%',
              boxShadow:
                '0 4px 24px rgba(17, 24, 39, 0.05)',
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Revenue by Category
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Which product categories drive the most sales
              </Typography>

              <Stack spacing={2}>
                {categoryData.map((item) => (
                  <Box key={item.category}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {item.category}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatCurrency(item.sales)}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={
                        (item.sales /
                          maxCategoryValue) *
                        100
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatNumber(item.orders)} orders
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: '100%',
              boxShadow:
                '0 4px 24px rgba(17, 24, 39, 0.05)',
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Top Customers
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Highest spending customers by total revenue
              </Typography>

              <Stack
                divider={
                  <Box
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                }
                spacing={0}
              >
                {customerData.map((customer) => (
                  <Stack
                    key={customer.name}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ py: 1.5 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.85rem',
                      }}
                    >
                      {getInitials(customer.name)}
                    </Avatar>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                      >
                        {customer.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatNumber(customer.orders)} orders
                      </Typography>
                    </Box>

                    <Chip
                      label={formatCurrency(
                        customer.spending
                      )}
                      size="small"
                      sx={{
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </AppLayout>
  );
}

