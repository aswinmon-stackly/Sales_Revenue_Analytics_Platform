
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

import { AppLayout } from '../../layouts/appLayout';
import { useAuth } from '../../hooks/useAuth';
import { customersService } from '../../services/customersService';
import { getErrorMessage } from '../../services/apiClient';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { StatusBadge } from '../../components/customers/StatusBadge';
import { SegmentBadge } from '../../components/customers/SegmentBadge';
import type { Customer, CustomerInput } from '../../types/customer';

const CARD_SX = {
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
        {value?.trim() ? value : '—'}
      </Typography>
    </Box>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomer = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    customersService
      .getCustomer(Number(id))
      .then(setCustomer)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCustomer, [id]);

  const handleFormSubmit = async (payload: CustomerInput) => {
    if (!customer) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await customersService.updateCustomer(customer.id, payload);
      setCustomer(updated);
      setFormOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Customer Details" subtitle="">
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      </AppLayout>
    );
  }

  if (error || !customer) {
    return (
      <AppLayout title="Customer Details" subtitle="">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error ?? 'Customer not found.'}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={customer.name} subtitle={customer.customer_code}>
      <Stack spacing={3}>
        {/* Profile Header */}
        <Card sx={CARD_SX}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                <Button
                  onClick={() => navigate('/customers')}
                  startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                  size="small"
                  sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 0, flexShrink: 0 }}
                >
                  Back
                </Button>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(customer.name)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} noWrap>
                    {customer.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" rowGap={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      {customer.customer_code}
                    </Typography>
                    <StatusBadge status={customer.status} />
                    <SegmentBadge segment={customer.segment} />
                  </Stack>
                </Box>
              </Stack>

              {isAdmin && (
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    setFormError(null);
                    setFormOpen(true);
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, alignSelf: { xs: 'stretch', sm: 'auto' } }}
                >
                  Edit Customer
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2.5}>
              {/* Customer Overview */}
              <Card sx={CARD_SX}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Customer Overview
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field label="Customer Name" value={customer.name} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field label="Customer Code" value={customer.customer_code} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field label="Company" value={customer.company} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Segment
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <SegmentBadge segment={customer.segment} />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card sx={CARD_SX}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <EmailRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25 }} />
                        <Field label="Email" value={customer.email} />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <PhoneRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25 }} />
                        <Field label="Phone" value={customer.phone} />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Location */}
              <Card sx={CARD_SX}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Location
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={12}>
                      <Field label="Address" value={customer.address} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Field label="City" value={customer.city} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Field label="State" value={customer.state} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Field label="Country" value={customer.country} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Field label="Region" value={customer.region} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Sales History - reserved for a later task */}
              <Card sx={CARD_SX}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Sales History
                  </Typography>
                  <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                    <ReceiptLongRoundedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      No sales history available yet
                    </Typography>
                    <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ maxWidth: 280 }}>
                      Purchase and order history for this customer will appear here once available.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Account Status */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={CARD_SX}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Account Status
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusBadge status={customer.status} />
                    </Box>
                  </Box>
                  <Divider />
                  <Field label="Created" value={formatDate(customer.created_at)} />
                  <Field label="Last Updated" value={formatDate(customer.updated_at)} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <CustomerForm
        open={formOpen}
        mode="edit"
        initialCustomer={customer}
        submitting={submitting}
        serverError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </AppLayout>
  );
}