
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';

import { AppLayout } from '../../layouts/appLayout';

const summaryData = [
  {
    title: 'Total Revenue',
    value: '₹5,01,000',
    change: '+12.5%',
    icon: <AttachMoneyRoundedIcon />,
    color: 'success.main',
  },
  {
    title: 'Total Orders',
    value: '850',
    change: '+8.2%',
    icon: <ShoppingCartRoundedIcon />,
    color: 'primary.main',
  },
  {
    title: 'Customers',
    value: '324',
    change: '+5.7%',
    icon: <PeopleAltRoundedIcon />,
    color: 'info.main',
  },
  {
    title: 'Growth',
    value: '18.4%',
    change: '+3.2%',
    icon: <TrendingUpRoundedIcon />,
    color: 'warning.main',
  },
];

const recentOrders = [
  {
    id: '#ORD-1001',
    customer: 'Acme Corporation',
    amount: '₹42,500',
    status: 'Completed',
  },
  {
    id: '#ORD-1002',
    customer: 'Tech Solutions Ltd',
    amount: '₹28,900',
    status: 'Processing',
  },
  {
    id: '#ORD-1003',
    customer: 'Global Enterprises',
    amount: '₹35,200',
    status: 'Completed',
  },
  {
    id: '#ORD-1004',
    customer: 'Prime Industries',
    amount: '₹19,750',
    status: 'Pending',
  },
  {
    id: '#ORD-1005',
    customer: 'Digital Works',
    amount: '₹24,100',
    status: 'Completed',
  },
];

const statusColor: Record<
  string,
  'success' | 'warning' | 'info'
> = {
  Completed: 'success',
  Processing: 'info',
  Pending: 'warning',
};

export function DashboardPage() {
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
                        color="success.main"
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
                    label="+12.5%"
                    color="success"
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
                  {[
                    45, 60, 52, 75, 68, 82, 90, 72, 88, 95, 84, 100,
                  ].map((height, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        height: `${height}%`,
                        minHeight: 20,
                        borderRadius: '6px 6px 0 0',
                        bgcolor:
                          index === 11
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
                  {[
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ].map((month) => (
                    <Typography
                      key={month}
                      variant="caption"
                      color="text.secondary"
                    >
                      {month}
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
                  August 2026
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
                      background:
                        'conic-gradient(#1976d2 0% 78%, #e5e7eb 78% 100%)',
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
                        78%
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
                    ₹5.01L of ₹6.50L target achieved
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
              />
            </Stack>

            <Stack spacing={0}>
              {recentOrders.map((order) => (
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
                      {order.id}
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
                    {order.amount}
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
          </CardContent>
        </Card>

      </Stack>
    </AppLayout>
  );
}

