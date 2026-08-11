import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';

import { AppLayout } from '../../layouts/appLayout';
import { salesService } from '../../services/salesService';
import { getErrorMessage } from '../../services/apiClient';
import type { DashboardSummary, Sale } from '../../types/sales';

const statusColor: Record<
  Sale['status'],
  'success' | 'warning' | 'info' | 'error'
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

// Mirrors the original design's "₹5.01L" lakh-style shorthand for the
// Monthly Target card.
function formatLakh(value: number): string {
  return `₹${(value / 100000).toFixed(2)}L`;
}

function formatChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await salesService.getDashboardSummary();
        if (!cancelled) {
          setSummary(data);
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

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppLayout
        title="Sales Overview"
        subtitle="Track orders, revenue, and customer activity in real time"
      >
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      </AppLayout>
    );
  }

  if (error || !summary) {
    return (
      <AppLayout
        title="Sales Overview"
        subtitle="Track orders, revenue, and customer activity in real time"
      >
        <Alert severity="error">
          {error ?? 'Unable to load dashboard data.'}
        </Alert>
      </AppLayout>
    );
  }

  const summaryData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.total_revenue),
      change: formatChange(summary.revenue_change_pct),
      icon: <AttachMoneyRoundedIcon />,
      color: 'success.main',
    },
    {
      title: 'Total Orders',
      value: String(summary.total_orders),
      change: formatChange(summary.orders_change_pct),
      icon: <ShoppingCartRoundedIcon />,
      color: 'primary.main',
    },
    {
      title: 'Customers',
      value: String(summary.total_customers),
      change: formatChange(summary.customers_change_pct),
      icon: <PeopleAltRoundedIcon />,
      color: 'info.main',
    },
    {
      title: 'Growth',
      value: `${summary.growth_pct}%`,
      change: formatChange(summary.growth_change_pct),
      icon: <TrendingUpRoundedIcon />,
      color: 'warning.main',
    },
  ];

  const maxMonthlyRevenue = Math.max(
    1,
    ...summary.monthly_revenue.map((point) => point.revenue)
  );
  const currentMonthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppLayout
      title="Sales Overview"
      subtitle="Track orders, revenue, and customer activity in real time"
    >
      <Stack spacing={3}>

        {/* Summary Cards */}
        <Grid container spacing={2.5}>
          {summaryData.map((item) => (
            <Grid
              key={item.title}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  boxShadow:
                    '0 4px 24px rgba(17, 24, 39, 0.05)',
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
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ mt: 1 }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        variant="caption"
                        color={item.change.startsWith('-') ? 'error.main' : 'success.main'}
                        fontWeight={700}
                      >
                        {item.change} from last month
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: item.color,
                        color: 'white',
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Revenue Overview */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                borderRadius: 4,
                height: '100%',
                boxShadow:
                  '0 4px 24px rgba(17, 24, 39, 0.05)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                    >
                      Revenue Overview
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Monthly revenue performance
                    </Typography>
                  </Box>

                  <Chip
                    label={formatChange(summary.revenue_change_pct)}
                    color={summary.revenue_change_pct < 0 ? 'error' : 'success'}
                    size="small"
                  />
                </Stack>

                <Box
                  sx={{
                    mt: 3,
                    height: 220,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: { xs: 1, md: 2 },
                    px: 1,
                  }}
                >
                  {summary.monthly_revenue.map((point, index) => (
                    <Box
                      key={`${point.month}-${index}`}
                      title={formatCurrency(point.revenue)}
                      sx={{
                        flex: 1,
                        height: `${Math.max((point.revenue / maxMonthlyRevenue) * 100, 2)}%`,
                        minHeight: 4,
                        borderRadius: '6px 6px 0 0',
                        bgcolor:
                          index === summary.monthly_revenue.length - 1
                            ? 'primary.main'
                            : 'primary.light',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  ))}
                </Box>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mt: 1 }}
                >
                  {summary.monthly_revenue.map((point, index) => (
                    <Typography
                      key={`${point.month}-label-${index}`}
                      variant="caption"
                      color="text.secondary"
                    >
                      {point.month}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Target */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                borderRadius: 4,
                height: '100%',
                boxShadow:
                  '0 4px 24px rgba(17, 24, 39, 0.05)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  Monthly Target
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {currentMonthLabel}
                </Typography>

                <Stack
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: `conic-gradient(#1976d2 0% ${Math.min(
                        summary.monthly_target.achieved_pct,
                        100
                      )}%, #e5e7eb ${Math.min(summary.monthly_target.achieved_pct, 100)}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 115,
                        height: 115,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={800}
                      >
                        {summary.monthly_target.achieved_pct}%
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Achieved
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    {formatLakh(summary.monthly_target.achieved_amount)} of{' '}
                    {formatLakh(summary.monthly_target.target_amount)} target achieved
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              '0 4px 24px rgba(17, 24, 39, 0.05)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  Recent Orders
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Latest customer orders
                </Typography>
              </Box>

              <Chip
                label="View All"
                variant="outlined"
                clickable
                component="a"
                href="/sales"
              />
            </Stack>

            {summary.recent_orders.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No orders yet
              </Typography>
            ) : (
              <Stack spacing={0}>
                {summary.recent_orders.map((order) => (
                  <Stack
                    key={order.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      py: 1.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        #{order.id}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {order.customer}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {formatCurrency(order.amount)}
                    </Typography>

                    <Chip
                      label={order.status}
                      size="small"
                      color={
                        statusColor[order.status] ??
                        'default'
                      }
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

      </Stack>
    </AppLayout>
  );
}
