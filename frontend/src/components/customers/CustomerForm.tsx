


import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

import type {
    Customer,
    CustomerInput,
    CustomerSegment,
} from '../../types/customer';

interface CustomerFormProps {
    open: boolean;
    mode: 'create' | 'edit';
    initialCustomer?: Customer | null;
    submitting: boolean;
    serverError: string | null;
    onClose: () => void;
    onSubmit: (payload: CustomerInput) => void;
}

interface FormState {
    customer_code: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    city: string;
    state: string;
    country: string;
    region: string;
    segment: CustomerSegment;
}

const EMPTY_FORM: FormState = {
    customer_code: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    country: '',
    region: '',
    segment: 'New',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

const RADIUS = 3;
const FIELD_RADIUS = 1.5;

function toFormState(customer?: Customer | null): FormState {
    if (!customer) return EMPTY_FORM;

    return {
        customer_code: customer.customer_code,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address ?? '',
        city: customer.city ?? '',
        state: customer.state ?? '',
        country: customer.country ?? '',
        region: customer.region ?? '',
        segment: customer.segment,
    };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            variant="overline"
            sx={{
                fontWeight: 700,
                letterSpacing: 0.8,
                color: 'text.secondary',
                fontSize: 11,
            }}
        >
            {children}
        </Typography>
    );
}

const textFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: FIELD_RADIUS,
        minHeight: 52,
    },
};

export function CustomerForm({
    open,
    mode,
    initialCustomer,
    submitting,
    serverError,
    onClose,
    onSubmit,
}: CustomerFormProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({});

    useEffect(() => {
        if (open) {
            setForm(toFormState(initialCustomer));
            setErrors({});
        }
    }, [open, initialCustomer]);

    const update = (patch: Partial<FormState>) => {
        setForm((previous) => ({
            ...previous,
            ...patch,
        }));
    };

    function validate(): boolean {
        const next: Partial<Record<keyof FormState, string>> = {};

        if (
            !form.customer_code.trim() ||
            form.customer_code.trim().length < 2
        ) {
            next.customer_code = 'Customer code is required';
        }

        if (!form.name.trim()) {
            next.name = 'Customer name is required';
        }

        if (!form.company.trim()) {
            next.company = 'Company is required';
        }

        if (
            !form.email.trim() ||
            !EMAIL_PATTERN.test(form.email.trim())
        ) {
            next.email = 'Enter a valid email address';
        }

        if (
            !form.phone.trim() ||
            !PHONE_PATTERN.test(form.phone.trim())
        ) {
            next.phone = 'Enter a valid phone number';
        }

        setErrors(next);

        return Object.keys(next).length === 0;
    }

    const handleSubmit = () => {
        if (!validate()) return;

        onSubmit({
            customer_code: form.customer_code.trim().toUpperCase(),
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            company: form.company.trim(),
            address: form.address.trim() || null,
            city: form.city.trim() || null,
            state: form.state.trim() || null,
            country: form.country.trim() || null,
            region: form.region.trim() || null,
            segment: form.segment,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : RADIUS,
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
                },
            }}
        >
            {/* HEADER */}
            <DialogTitle
                sx={{
                    px: 3,
                    py: 2.5,
                    background:
                        'linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.025))',
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {/* Icon */}
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                flexShrink: 0,
                            }}
                        >
                            <PersonAddRoundedIcon />
                        </Box>

                        {/* Title */}
                        <Stack spacing={0.25}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ lineHeight: 1.3 }}
                            >
                                {mode === 'create'
                                    ? 'Add Customer'
                                    : 'Edit Customer'}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {mode === 'create'
                                    ? 'Create a new customer record'
                                    : 'Update customer information'}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Close */}
                    <IconButton
                        onClick={onClose}
                        disabled={submitting}
                        size="small"
                        sx={{
                            mt: -0.5,
                            mr: -0.5,
                            borderRadius: 2,
                        }}
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            {/* CONTENT */}
            <DialogContent
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 3,
                }}
            >
                <Stack spacing={3.5}>
                    {/* SERVER ERROR */}
                    {serverError && (
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            {serverError}
                        </Alert>
                    )}

                    {/* CUSTOMER INFORMATION */}
                    <Stack spacing={2}>
                        <SectionLabel>
                            Customer Information
                        </SectionLabel>

                        <Grid container spacing={2}>
                            {/* Customer Name */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Customer Name"
                                    placeholder="Enter customer name"
                                    value={form.name}
                                    onChange={(e) =>
                                        update({ name: e.target.value })
                                    }
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    fullWidth
                                    sx={textFieldSx}
                                    // sx={{
                                    //     ...textFieldSx,
                                    //     width: 300,
                                    //     maxWidth: '100%',
                                    //     height: 52,
                                    //     maxHeight: '100%',
                                    // }}
                                />
                            </Grid>

                            {/* Customer Code */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Customer Code"
                                    placeholder="e.g. CUS-1001"
                                    value={form.customer_code}
                                    onChange={(e) =>
                                        update({
                                            customer_code: e.target.value,
                                        })
                                    }
                                    error={!!errors.customer_code}
                                    helperText={
                                        errors.customer_code ??
                                        'Use a unique customer code'
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* Company */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Company"
                                    placeholder="Enter company name"
                                    value={form.company}
                                    onChange={(e) =>
                                        update({ company: e.target.value })
                                    }
                                    error={!!errors.company}
                                    helperText={errors.company}
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* Segment */}

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    label="Segment"
                                    value={form.segment}
                                    onChange={(e) =>
                                        update({
                                            segment: e.target.value as CustomerSegment,
                                        })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                >
                                    <MenuItem value="Enterprise">Enterprise</MenuItem>
                                    <MenuItem value="Premium">Premium</MenuItem>
                                    <MenuItem value="Standard">Standard</MenuItem>
                                    <MenuItem value="New">New</MenuItem>
                                    <MenuItem value="At Risk">At Risk</MenuItem>
                                </TextField>
                            </Grid>


                        </Grid>
                    </Stack>

                    {/* CONTACT INFORMATION */}
                    <Stack spacing={2}>
                        <SectionLabel>
                            Contact Information
                        </SectionLabel>

                        <Grid container spacing={2}>
                            {/* Email */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    placeholder="customer@example.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        update({ email: e.target.value })
                                    }
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Phone"
                                    placeholder="+91 98765 43210"
                                    value={form.phone}
                                    onChange={(e) =>
                                        update({ phone: e.target.value })
                                    }
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>
                        </Grid>
                    </Stack>

                    {/* LOCATION */}
                    <Stack spacing={2}>
                        <SectionLabel>
                            Location
                        </SectionLabel>

                        <Grid container spacing={2}>
                            {/* Address */}
                            <Grid size={12}>
                                <TextField
                                    label="Address"
                                    placeholder="Enter customer address"
                                    value={form.address}
                                    onChange={(e) =>
                                        update({ address: e.target.value })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* City */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label="City"
                                    placeholder="City"
                                    value={form.city}
                                    onChange={(e) =>
                                        update({ city: e.target.value })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* State */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label="State"
                                    placeholder="State"
                                    value={form.state}
                                    onChange={(e) =>
                                        update({ state: e.target.value })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* Country */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label="Country"
                                    placeholder="Country"
                                    value={form.country}
                                    onChange={(e) =>
                                        update({ country: e.target.value })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>

                            {/* Region */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Region"
                                    placeholder="Region"
                                    value={form.region}
                                    onChange={(e) =>
                                        update({ region: e.target.value })
                                    }
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
            </DialogContent>

            <Divider />

            {/* FOOTER */}
            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    bgcolor: 'grey.50',
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    sx={{
                        borderRadius: FIELD_RADIUS,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{
                        borderRadius: FIELD_RADIUS,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        minWidth: 140,
                    }}
                >
                    {submitting
                        ? mode === 'create'
                            ? 'Creating...'
                            : 'Saving...'
                        : mode === 'create'
                            ? 'Create Customer'
                            : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}