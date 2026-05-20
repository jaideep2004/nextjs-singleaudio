'use client';

import { ReactNode } from 'react';
import { Box, Chip, Paper, Stack, SxProps, Theme, Typography, useTheme } from '@mui/material';

export function premiumSurfaceSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '32px',
    border: '1px solid',
    borderColor: isDark ? 'rgba(247,243,232,0.12)' : 'rgba(17,24,39,0.10)',
    bgcolor: isDark ? 'rgba(18,26,43,0.92)' : '#ffffff',
    boxShadow: isDark
      ? '0 24px 70px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 24px 70px rgba(27,39,68,0.10), inset 0 1px 0 rgba(255,255,255,0.86)',
    overflow: 'hidden',
  };
}

export function premiumTableSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === 'dark';
  return {
    ...premiumSurfaceSx(theme),
    '& .MuiTableHead-root .MuiTableCell-root': {
      bgcolor: isDark ? 'rgba(247,243,232,0.035)' : 'rgba(238,243,248,0.78)',
      color: 'text.secondary',
      fontSize: 12,
      textTransform: 'uppercase',
    },
    '& .MuiTableRow-root': {
      transition: 'background-color 160ms ease, transform 160ms ease',
    },
    '& .MuiTableBody-root .MuiTableRow-root:hover': {
      bgcolor: isDark ? 'rgba(91,95,247,0.08)' : 'rgba(91,95,247,0.055)',
    },
    '& .MuiTableCell-root': {
      py: 1.75,
    },
  };
}

export function PremiumPanel({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  const theme = useTheme();
  return (
    <Paper sx={[premiumSurfaceSx(theme), { p: { xs: 2, sm: 2.5 } }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {children}
    </Paper>
  );
}

export function PremiumHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      sx={{
        ...premiumSurfaceSx(theme),
        p: { xs: 2.5, md: 3.5 },
        borderRadius: { xs: '24px', md: '32px' },
        mb: 3,
        position: 'relative',
        background: isDark
          ? 'linear-gradient(135deg, rgba(18,26,43,0.98), rgba(14,20,35,0.96))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'linear-gradient(110deg, rgba(91,95,247,0.16), transparent 34%, rgba(245,165,36,0.10))'
            : 'linear-gradient(110deg, rgba(91,95,247,0.10), transparent 34%, rgba(245,165,36,0.12))',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Box sx={{ minWidth: 0, maxWidth: 760 }}>
          {eyebrow ? (
            <Chip
              label={eyebrow}
              size="small"
              sx={{
                mb: 1.25,
                bgcolor: isDark ? 'rgba(91,95,247,0.16)' : 'rgba(91,95,247,0.10)',
                color: isDark ? '#c6c8ff' : '#3438c7',
              }}
            />
          ) : null}
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0, textWrap: 'balance' }}>
            {title}
          </Typography>
          {description ? (
            <Typography sx={{ mt: 0.75, color: 'text.secondary', maxWidth: 680 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>{action}</Box> : null}
      </Stack>
    </Paper>
  );
}

export function PremiumMetric({
  label,
  value,
  hint,
  accent = '#5b5ff7',
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      sx={{
        ...premiumSurfaceSx(theme),
        p: 2.25,
        minHeight: 148,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          bgcolor: accent,
        },
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1.25, fontWeight: 900, color: 'text.primary' }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: isDark ? 'rgba(247,243,232,0.58)' : '#64748b' }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}
