import { createTheme } from '@mui/material/styles';

// Design tokens for the sidebar shell — not part of the MUI palette,
// but kept alongside the theme so the two stay visually coordinated.
export const sidebarTokens = {
  background: '#0F2B24',
  backgroundElevated: '#153A31',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#F2F5F3',
  textMuted: 'rgba(242, 245, 243, 0.56)',
  activeBg: 'rgba(61, 217, 175, 0.14)',
  activeText: '#5CE6BE',
  hoverBg: 'rgba(255, 255, 255, 0.05)',
  width: 264,
  widthCollapsed: 76,
};

// A confident slate/teal palette for a data-dense analytics tool —
// deliberately avoiding MUI's default indigo/blue.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0E6B5C',
      light: '#3D8B7D',
      dark: '#094A3F',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C97A2B',
      light: '#E0A05C',
      dark: '#9C5D1E',
    },
    background: {
      default: '#F3F2ED',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B2320',
      secondary: '#5B6B65',
    },
    divider: '#E4E2DA',
    success: { main: '#2E7D5B' },
    warning: { main: '#C97A2B' },
    error: { main: '#B3432B' },
    info: { main: '#2C6E8F' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: '#5B6B65' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E4E2DA',
          boxShadow: '0 1px 2px rgba(27, 35, 32, 0.04)',
          transition: 'box-shadow 160ms ease, border-color 160ms ease',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#5B6B65',
          backgroundColor: '#FBFAF7',
          borderBottom: '1px solid #E4E2DA',
        },
        body: {
          borderBottom: '1px solid #EFEDE6',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-of-type td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 10px rgba(14, 107, 92, 0.24)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});
