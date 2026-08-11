import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { AppLayout } from '../../layouts/appLayout';
import { useAuth } from '../../hooks/useAuth';

type SectionId =
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'data';

interface Settings {
  displayName: string;
  email: string;
  role: string;
  defaultPageSize: number;
  defaultSortField: string;
  defaultSortOrder: string;
  emailNotifications: boolean;
  weeklySummaryEmail: boolean;
  lowStockAlerts: boolean;
  currency: string;
}

const DEFAULT_SETTINGS: Settings = {
  displayName: '',
  email: '',
  role: '',
  defaultPageSize: 10,
  defaultSortField: 'Order Date',
  defaultSortOrder: 'Descending',
  emailNotifications: true,
  weeklySummaryEmail: true,
  lowStockAlerts: false,
  currency: 'INR',
};

const NAV_ITEMS: {
  id: SectionId;
  label: string;
  danger?: boolean;
}[] = [
  {
    id: 'profile',
    label: 'My Profile',
  },
  {
    id: 'preferences',
    label: 'Preferences',
  },
  {
    id: 'notifications',
    label: 'Notifications',
  },
  {
    id: 'data',
    label: 'Reset Local Data',
    danger: true,
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  const first = parts[0]?.[0] ?? '';

  const last =
    parts.length > 1
      ? parts[parts.length - 1]?.[0] ?? ''
      : '';

  return `${first}${last}`.toUpperCase();
}

function SettingRow({
  title,
  description,
  control,
  last = false,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
  last?: boolean;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ py: 2 }}
      >
        <Box
          sx={{
            minWidth: 0,
            pr: 2,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {description}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {control}
        </Box>
      </Stack>

      {!last && <Divider />}
    </Box>
  );
}

function SectionHeading({
  title,
}: {
  title: string;
}) {
  return (
    <Typography
      variant="subtitle1"
      fontWeight={700}
      sx={{ mb: 0.5 }}
    >
      {title}
    </Typography>
  );
}

export default function SettingsPage() {
  const { user, token } = useAuth();

  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [draft, setDraft] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [activeSection, setActiveSection] =
    useState<SectionId>('profile');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'info',
  });

  /*
   * Sync logged-in user data from AuthContext
   */
  useEffect(() => {
    if (!user) return;

    setSettings((previous) => ({
      ...previous,
      displayName: user.name,
      email: user.email,
      role: user.role,
    }));

    setDraft((previous) => ({
      ...previous,
      displayName: user.name,
      email: user.email,
      role: user.role,
    }));
  }, [user]);

  /*
   * Access token is available here if this page
   * needs to make an authenticated request.
   *
   * Do not display the token in the UI.
   */
  console.log('Access token available:', Boolean(token));

  const isDirty =
    JSON.stringify(draft) !==
    JSON.stringify(settings);

  const updateDraft = (
    patch: Partial<Settings>
  ) => {
    setDraft((previous) => ({
      ...previous,
      ...patch,
    }));
  };

  const handleSave = () => {
    setSettings(draft);

    setSnackbar({
      open: true,
      message: 'Settings saved successfully.',
      severity: 'success',
    });
  };

  const handleDiscard = () => {
    setDraft(settings);
  };

  const handleReset = () => {
    const resetSettings: Settings = {
      ...DEFAULT_SETTINGS,
      displayName: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? '',
    };

    setSettings(resetSettings);
    setDraft(resetSettings);

    setSnackbar({
      open: true,
      message: 'Settings reset successfully.',
      severity: 'info',
    });
  };

  return (
    <AppLayout
      title="Settings"
      subtitle="Manage your profile, preferences, and notifications"
    >
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          minHeight: 560,
          overflow: 'hidden',
        }}
      >
        {/* Settings Navigation */}
        <Box
          sx={{
            width: {
              xs: '100%',
              md: 240,
            },
            flexShrink: 0,
            borderRight: {
              md: '1px solid',
            },
            borderBottom: {
              xs: '1px solid',
              md: 'none',
            },
            borderColor: 'divider',
            py: 1.5,
          }}
        >
          <List sx={{ px: 1.5 }}>
            {NAV_ITEMS.map((item) => {
              const selected =
                activeSection === item.id;

              return (
                <ListItemButton
                  key={item.id}
                  selected={
                    selected && !item.danger
                  }
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,

                    color: item.danger
                      ? 'error.main'
                      : undefined,

                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color:
                        'primary.contrastText',

                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: '0.875rem',
                        fontWeight: selected
                          ? 600
                          : 500,
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            p: {
              xs: 2.5,
              md: 3.5,
            },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Profile */}
          {activeSection === 'profile' && (
            <Box>
              <SectionHeading title="My Profile" />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Your name and email as shown
                across the dashboard.
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.1rem',
                  }}
                >
                  {getInitials(
                    draft.displayName || '?'
                  )}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                  >
                    {draft.displayName ||
                      'Unnamed user'}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                  >
                    {draft.email ||
                      'No email set'}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <SettingRow
                title="Display name"
                description="Shown in the top bar and shared reports"
                control={
                  <TextField
                    size="small"
                    value={draft.displayName}
                    onChange={(event) =>
                      updateDraft({
                        displayName:
                          event.target.value,
                      })
                    }
                    sx={{ width: 240 }}
                  />
                }
              />

              <SettingRow
                title="Email"
                description="Used for sign-in and notifications"
                control={
                  <TextField
                    size="small"
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      updateDraft({
                        email:
                          event.target.value,
                      })
                    }
                    sx={{ width: 240 }}
                  />
                }
              />

              <SettingRow
                title="Role"
                description="Displayed on your profile"
                last
                control={
                  <TextField
                    size="small"
                    value={draft.role}
                    disabled
                    sx={{ width: 240 }}
                  />
                }
              />
            </Box>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <Box>
              <SectionHeading title="Preferences" />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Configure your dashboard
                display preferences.
              </Typography>

              <SettingRow
                title="Default rows per page"
                description="Number of records shown in tables"
                control={
                  <Select
                    size="small"
                    value={
                      draft.defaultPageSize
                    }
                    onChange={(event) =>
                      updateDraft({
                        defaultPageSize:
                          Number(
                            event.target.value
                          ),
                      })
                    }
                    sx={{ width: 180 }}
                  >
                    <MenuItem value={5}>
                      5
                    </MenuItem>

                    <MenuItem value={10}>
                      10
                    </MenuItem>

                    <MenuItem value={25}>
                      25
                    </MenuItem>

                    <MenuItem value={50}>
                      50
                    </MenuItem>
                  </Select>
                }
              />

              <SettingRow
                title="Default sort field"
                description="Column used to sort sales"
                control={
                  <Select
                    size="small"
                    value={
                      draft.defaultSortField
                    }
                    onChange={(event) =>
                      updateDraft({
                        defaultSortField:
                          event.target.value,
                      })
                    }
                    sx={{ width: 180 }}
                  >
                    <MenuItem value="Order Date">
                      Order Date
                    </MenuItem>

                    <MenuItem value="Amount">
                      Amount
                    </MenuItem>

                    <MenuItem value="Quantity">
                      Quantity
                    </MenuItem>
                  </Select>
                }
              />

              <SettingRow
                title="Default sort order"
                description="Ascending or descending"
                control={
                  <Select
                    size="small"
                    value={
                      draft.defaultSortOrder
                    }
                    onChange={(event) =>
                      updateDraft({
                        defaultSortOrder:
                          event.target.value,
                      })
                    }
                    sx={{ width: 180 }}
                  >
                    <MenuItem value="Ascending">
                      Ascending
                    </MenuItem>

                    <MenuItem value="Descending">
                      Descending
                    </MenuItem>
                  </Select>
                }
              />

              <SettingRow
                title="Currency"
                description="Currency used across the dashboard"
                last
                control={
                  <Select
                    size="small"
                    value={draft.currency}
                    onChange={(event) =>
                      updateDraft({
                        currency:
                          event.target.value,
                      })
                    }
                    sx={{ width: 180 }}
                  >
                    <MenuItem value="INR">
                      INR
                    </MenuItem>

                    <MenuItem value="USD">
                      USD
                    </MenuItem>

                    <MenuItem value="EUR">
                      EUR
                    </MenuItem>

                    <MenuItem value="GBP">
                      GBP
                    </MenuItem>
                  </Select>
                }
              />
            </Box>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Box>
              <SectionHeading title="Notifications" />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Choose what you'd like to be
                notified about.
              </Typography>

              <SettingRow
                title="Email notifications"
                description="Receive important sales notifications"
                control={
                  <Switch
                    checked={
                      draft.emailNotifications
                    }
                    onChange={(event) =>
                      updateDraft({
                        emailNotifications:
                          event.target.checked,
                      })
                    }
                  />
                }
              />

              <SettingRow
                title="Weekly summary email"
                description="Receive a weekly sales summary"
                control={
                  <Switch
                    checked={
                      draft.weeklySummaryEmail
                    }
                    onChange={(event) =>
                      updateDraft({
                        weeklySummaryEmail:
                          event.target.checked,
                      })
                    }
                  />
                }
              />

              <SettingRow
                title="Low stock alerts"
                description="Get notified when products are running low"
                last
                control={
                  <Switch
                    checked={
                      draft.lowStockAlerts
                    }
                    onChange={(event) =>
                      updateDraft({
                        lowStockAlerts:
                          event.target.checked,
                      })
                    }
                  />
                }
              />
            </Box>
          )}

          {/* Reset Data */}
          {activeSection === 'data' && (
            <Box>
              <SectionHeading title="Reset Local Data" />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Reset your dashboard settings
                and preferences.
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                justifyContent="space-between"
                alignItems={{
                  sm: 'center',
                }}
                spacing={1.5}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    'rgba(179, 67, 43, 0.06)',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    Reset dashboard settings
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Restore all settings to their
                    default values
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={
                    <DeleteOutlineRoundedIcon />
                  }
                  onClick={handleReset}
                  sx={{ flexShrink: 0 }}
                >
                  Reset
                </Button>
              </Stack>
            </Box>
          )}

          {/* Save Buttons */}
          {activeSection !== 'data' && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{
                mt: 'auto',
                pt: 3,
              }}
            >
              <Button
                variant="text"
                onClick={handleDiscard}
                disabled={!isDirty}
              >
                Discard changes
              </Button>

              <Button
                variant="contained"
                startIcon={
                  <SaveRoundedIcon />
                }
                onClick={handleSave}
                disabled={!isDirty}
              >
                Save changes
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((previous) => ({
              ...previous,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}