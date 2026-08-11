
import { Box, Button, Chip, Drawer, Stack, Tooltip, Typography } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sidebarTokens } from '../../Style/theme';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  icon: ReactNode;
  to?: string;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <SpaceDashboardRoundedIcon fontSize="small" />, to: '/dashboard' },
  { label: 'Sales', icon: <ReceiptLongRoundedIcon fontSize="small" />, to: '/sales' },
  { label: 'Customers', icon: <GroupRoundedIcon fontSize="small" />, to: '/customers' },
  { label: 'Reports', icon: <InsightsRoundedIcon fontSize="small" />, to: '/reports' },
];

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const row = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        px: 2,
        py: 1.1,
        mx: 1.5,
        borderRadius: 2,
        cursor: item.comingSoon ? 'default' : 'pointer',
        color: active ? sidebarTokens.activeText : sidebarTokens.textMuted,
        bgcolor: active ? sidebarTokens.activeBg : 'transparent',
        opacity: item.comingSoon ? 0.55 : 1,
        transition: 'background-color 140ms ease, color 140ms ease',
        '&:hover': item.comingSoon
          ? undefined
          : {
              bgcolor: active ? sidebarTokens.activeBg : sidebarTokens.hoverBg,
              color: active ? sidebarTokens.activeText : sidebarTokens.textPrimary,
            },
      }}
    >
      <Box sx={{ display: 'flex', color: 'inherit' }}>{item.icon}</Box>
      <Typography variant="body2" fontWeight={active ? 700 : 500} color="inherit" sx={{ flexGrow: 1 }}>
        {item.label}
      </Typography>
      {item.comingSoon && (
        <Chip
          label="Soon"
          size="small"
          sx={{
            height: 18,
            fontSize: '0.62rem',
            bgcolor: 'rgba(255, 0, 0, 0.08)',
            color: sidebarTokens.textMuted,
          }}
        />
      )}
    </Stack>
  );

  if (item.comingSoon || !item.to) {
    return (
      <Tooltip title="Coming soon" placement="right">
        <Box>{row}</Box>
      </Tooltip>
    );
  }

  return (
    <Box component={Link} to={item.to} onClick={onNavigate} sx={{ textDecoration: 'none', display: 'block' }}>
      {row}
    </Box>
  );
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const { logout } = useAuth(); // Consume the centralized auth hook

  const handleLogout = () => {
    if (onNavigate) onNavigate(); // Close mobile drawer first if open
    logout(); // Triggers token removal, clears user state, and forces redirect to /
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: sidebarTokens.background,
        color: sidebarTokens.textPrimary,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 3, py: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: sidebarTokens.activeBg,
            color: sidebarTokens.activeText,
          }}
        >
          <BarChartRoundedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
            Sales
          </Typography>
          <Typography variant="caption" sx={{ color: sidebarTokens.textMuted }} noWrap>
            Analytics Dashboard
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="caption"
        sx={{ px: 3.5, mb: 1, mt: 1, color: sidebarTokens.textMuted, letterSpacing: '0.08em', fontWeight: 700 }}
      >
        MENU
      </Typography>
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.label} item={item} active={location.pathname === item.to} onNavigate={onNavigate} />
        ))}
      </Stack>

      {/* Footer / Fixed Section */}
      <Box sx={{ borderTop: `1px solid ${sidebarTokens.border}`, px: 1.5, py: 1.5 }}>
        <Stack spacing={0.5}>
          <NavRow
            item={{ label: 'Settings', icon: <SettingsRoundedIcon fontSize="small" />, comingSoon: false, to: '/settings' }}
            active={location.pathname === '/settings'}
            onNavigate={onNavigate}
          />
        
          <Button
            disableRipple
            onClick={handleLogout}
            startIcon={<LogoutRoundedIcon fontSize="small" />}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              py: 1.1,
              mx: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              color: 'error.main',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'background-color 140ms ease',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Permanent sidebar on desktop */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarTokens.width,
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: 'fixed', width: sidebarTokens.width, height: '100vh' }}>
          <SidebarContent />
        </Box>
      </Box>

      {/* Temporary drawer on mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: sidebarTokens.width, boxSizing: 'border-box', border: 'none' },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>
    </>
  );
}

export { sidebarTokens };