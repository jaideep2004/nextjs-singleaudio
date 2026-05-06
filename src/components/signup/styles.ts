import { SxProps, Theme } from '@mui/material/styles';

export const fieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: 60,
    borderRadius: '16px',
    backgroundColor: 'rgba(255,255,255,0.035)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
    '&.Mui-focused fieldset': { borderColor: '#4a6cf7' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.52)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#4a6cf7' },
  '& .MuiInputBase-input': { color: '#f8fafc' },
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
};

export const multilineFieldSx: SxProps<Theme> = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...(fieldSx as Record<string, any>)['& .MuiOutlinedInput-root'],
    minHeight: 'unset',
  },
};

export const twoColumnGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 2,
};

export const formSectionSx: SxProps<Theme> = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export const sectionTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  color: '#f8fafc',
  mb: 0.5,
};

export const sectionCaptionSx: SxProps<Theme> = {
  color: 'rgba(255,255,255,0.52)',
};

export const compactToggleGroupSx: SxProps<Theme> = {
  width: '100%',
  gap: 1.5,
  flexWrap: 'wrap',
  '& .MuiToggleButton-root': {
    minHeight: 44,
    color: 'rgba(255,255,255,0.58)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: '12px !important',
    px: 2.5,
    py: 1,
    textTransform: 'none',
    fontWeight: 600,
    '&.Mui-selected': {
      color: '#93c5fd',
      background: 'rgba(74, 108, 247, 0.14)',
      borderColor: '#4a6cf7 !important',
    },
  },
};
