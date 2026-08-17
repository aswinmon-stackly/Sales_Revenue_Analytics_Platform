
import { Box, alpha, useTheme } from '@mui/material';
import type { CustomerSegment } from '../../types/customer';

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  const theme = useTheme();

  // Each segment maps to a theme color so the palette stays within the
  // existing MUI theme while remaining visually distinct and subtle.
  const SEGMENT_COLOR: Record<CustomerSegment, string> = {
    Enterprise: theme.palette.primary.main,
    Premium: theme.palette.secondary.main,
    Standard: theme.palette.info.main,
    New: theme.palette.text.secondary,
    'At Risk': theme.palette.error.main,
  };

  const color = SEGMENT_COLOR[segment];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.375,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0.2,
        color,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.24)}`,
        whiteSpace: 'nowrap',
      }}
    >
      {segment}
    </Box>
  );
}