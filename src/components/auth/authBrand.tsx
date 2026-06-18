'use client';

import { Box, useTheme } from '@mui/material';
import { PaletteMode } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const AUTH_BACKGROUND = `
  radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123, 31, 162, 0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 10% 80%, rgba(237, 30, 121, 0.10) 0%, transparent 60%),
  radial-gradient(ellipse 50% 60% at 50% 50%, rgba(83, 12, 195, 0.07) 0%, transparent 70%),
  #05050A
`;

export const AUTH_LIGHT_BACKGROUND = `
  radial-gradient(ellipse 80% 50% at 80% 18%, rgba(237, 30, 121, 0.13) 0%, transparent 58%),
  radial-gradient(ellipse 62% 44% at 8% 82%, rgba(123, 31, 162, 0.10) 0%, transparent 62%),
  radial-gradient(ellipse 50% 60% at 50% 48%, rgba(83, 12, 195, 0.06) 0%, transparent 72%),
  #fff8fc
`;

export const AUTH_BUTTON_GRADIENT = 'linear-gradient(135deg,#ed1e79,#7b1fa2)';

export const AUTH_PANEL_GRADIENT =
  'linear-gradient(150deg, rgba(12,5,20,0.96) 0%, rgba(39,7,50,0.9) 48%, rgba(9,7,18,0.96) 100%)';

export const AUTH_SURFACE_GRADIENT =
  'linear-gradient(180deg, rgba(16,10,24,0.94), rgba(8,8,18,0.9))';

export const getAuthTokens = (mode: PaletteMode) => {
  const isDark = mode === 'dark';

  return {
    isDark,
    pageBackground: isDark ? AUTH_BACKGROUND : AUTH_LIGHT_BACKGROUND,
    pageBgColor: isDark ? '#05050a' : '#fff8fc',
    panelBackground: isDark
      ? AUTH_PANEL_GRADIENT
      : 'linear-gradient(150deg, rgba(255,255,255,0.94) 0%, rgba(255,232,246,0.92) 46%, rgba(247,239,255,0.96) 100%)',
    panelOverlay: isDark
      ? 'radial-gradient(circle at top right, rgba(237,30,121,0.22), transparent 24%), radial-gradient(circle at bottom left, rgba(123,31,162,0.2), transparent 22%)'
      : 'radial-gradient(circle at top right, rgba(237,30,121,0.18), transparent 25%), radial-gradient(circle at bottom left, rgba(123,31,162,0.14), transparent 24%)',
    surfaceBackground: isDark
      ? AUTH_SURFACE_GRADIENT
      : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,247,252,0.94))',
    panelText: isDark ? '#f8fafc' : '#16111a',
    panelMuted: isDark ? 'rgba(226,232,240,0.72)' : 'rgba(55,45,62,0.72)',
    text: isDark ? '#f8fafc' : '#15111a',
    muted: isDark ? 'rgba(226,232,240,0.68)' : 'rgba(64,56,72,0.68)',
    faint: isDark ? 'rgba(255,255,255,0.36)' : 'rgba(49,35,56,0.48)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(123,31,162,0.14)',
    cardBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(123,31,162,0.16)',
    fieldBg: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.82)',
    fieldBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(52,37,59,0.16)',
    fieldHoverBorder: isDark ? 'rgba(237,30,121,0.38)' : 'rgba(237,30,121,0.42)',
    fieldLabel: isDark ? 'rgba(255,255,255,0.58)' : 'rgba(42,35,49,0.68)',
    fieldText: isDark ? '#f8fafc' : '#15111a',
    icon: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(42,35,49,0.58)',
    divider: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(123,31,162,0.14)',
    shadow: isDark ? '0 24px 60px rgba(2,8,23,0.38)' : '0 24px 60px rgba(123,31,162,0.14)',
  };
};

export const authStyleVars = (mode: PaletteMode): CSSProperties => {
  const tokens = getAuthTokens(mode);

  return {
    '--auth-text': tokens.text,
    '--auth-muted': tokens.muted,
    '--auth-faint': tokens.faint,
    '--auth-panel-text': tokens.panelText,
    '--auth-panel-muted': tokens.panelMuted,
    '--auth-card-bg': tokens.cardBg,
    '--auth-card-border': tokens.cardBorder,
    '--auth-field-bg': tokens.fieldBg,
    '--auth-field-border': tokens.fieldBorder,
    '--auth-field-hover-border': tokens.fieldHoverBorder,
    '--auth-field-label': tokens.fieldLabel,
    '--auth-field-text': tokens.fieldText,
    '--auth-icon': tokens.icon,
    '--auth-divider': tokens.divider,
  } as CSSProperties;
};

export function AuthLogo({
  width = 220,
  mb = 0,
}: {
  width?: number;
  mb?: number;
}) {
  const theme = useTheme();

  return (
    <Box
      component="img"
      src={theme.palette.mode === 'dark' ? '/images/singleaudio-b1.png' : '/images/singleaudio-w.png'}
      alt="Single Audio Distribution"
      translate="no"
      sx={{
        width,
        maxWidth: '76%',
        height: 'auto',
        mb,
        display: 'block',
      }}
    />
  );
}
