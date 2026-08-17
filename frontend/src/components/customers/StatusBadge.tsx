
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { CustomerStatus } from '../../types/customer';

export function StatusBadge({ status }: { status: CustomerStatus }) {
  const theme = useTheme();
  const isActive = status === 'ACTIVE';
  const color = isActive ? theme.palette.success.main : theme.palette.text.secondary;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        display: 'inline-flex',
        px: 1.25,
        py: 0.375,
        borderRadius: 999,
        bgcolor: alpha(color, isActive ? 0.12 : 0.08),
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          lineHeight: 1,
          color,
          letterSpacing: 0.2,
        }}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Typography>
    </Stack>
  );
}