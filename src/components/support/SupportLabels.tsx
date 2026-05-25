'use client';

import { Chip, type ChipProps } from '@mui/material';
import {
  Flag,
  RadioButtonChecked,
  Schedule,
  TaskAlt,
  Visibility,
} from '@mui/icons-material';
import type { SupportTicketPriority, SupportTicketStatus } from '@/services/api';

const statusMeta: Record<SupportTicketStatus, { label: string; color: string; bg: string; icon: ChipProps['icon'] }> = {
  open: { label: 'Open', color: '#0f766e', bg: 'rgba(20,184,166,0.14)', icon: <RadioButtonChecked /> },
  in_review: { label: 'In Review', color: '#7c3aed', bg: 'rgba(124,58,237,0.14)', icon: <Visibility /> },
  waiting_for_user: { label: 'Waiting For User', color: '#b45309', bg: 'rgba(245,158,11,0.18)', icon: <Schedule /> },
  resolved: { label: 'Resolved', color: '#15803d', bg: 'rgba(34,197,94,0.16)', icon: <TaskAlt /> },
  closed: { label: 'Closed', color: '#475569', bg: 'rgba(100,116,139,0.16)', icon: <TaskAlt /> },
};

const priorityMeta: Record<SupportTicketPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: '#0f766e', bg: 'rgba(20,184,166,0.12)' },
  normal: { label: 'Normal', color: '#475569', bg: 'rgba(100,116,139,0.14)' },
  high: { label: 'High', color: '#b45309', bg: 'rgba(245,158,11,0.18)' },
  urgent: { label: 'Urgent', color: '#be123c', bg: 'rgba(244,63,94,0.18)' },
};

const chipSx = (color: string, bg: string) => ({
  bgcolor: bg,
  color,
  border: '1px solid',
  borderColor: color,
  fontWeight: 900,
  '& .MuiChip-icon': { color, fontSize: 16 },
});

export function SupportStatusChip({ status, size = 'small' }: { status?: SupportTicketStatus | string; size?: ChipProps['size'] }) {
  const meta = statusMeta[(status || 'open') as SupportTicketStatus] || {
    label: String(status || 'Open'),
    color: '#475569',
    bg: 'rgba(100,116,139,0.14)',
    icon: undefined,
  };

  return <Chip size={size} icon={meta.icon} label={meta.label} sx={chipSx(meta.color, meta.bg)} />;
}

export function SupportPriorityChip({ priority, size = 'small' }: { priority?: SupportTicketPriority | string; size?: ChipProps['size'] }) {
  const meta = priorityMeta[(priority || 'normal') as SupportTicketPriority] || {
    label: String(priority || 'Normal'),
    color: '#475569',
    bg: 'rgba(100,116,139,0.14)',
  };

  return <Chip size={size} icon={<Flag />} label={meta.label} sx={chipSx(meta.color, meta.bg)} />;
}

