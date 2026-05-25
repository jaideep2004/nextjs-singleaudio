'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AssignmentInd,
  Clear,
  Notes,
  Search,
  Send as SendIcon,
  SupportAgent,
} from '@mui/icons-material';
import {
  adminSupportAPI,
  SUPPORT_CATEGORIES,
  type SupportTicketSort,
  type SupportTicketStatus,
} from '@/services/api';
import { useAuth } from '@/context/AppContext';
import { AttachmentPreview } from '@/components/support/AttachmentPreview';
import { SupportPriorityChip, SupportStatusChip } from '@/components/support/SupportLabels';

const statuses: Array<{ value: SupportTicketStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'waiting_for_user', label: 'Waiting For User' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const categoryLabels = Object.fromEntries(SUPPORT_CATEGORIES.map((category) => [category.value, category.label]));

const sortOptions: Array<{ value: SupportTicketSort; label: string }> = [
  { value: 'latest', label: 'Latest Chat' },
  { value: 'oldest', label: 'Oldest Chat' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [sort, setSort] = useState<SupportTicketSort>('latest');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<SupportTicketStatus>('in_review');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedTicket = useMemo(
    () => detail?.ticket || tickets.find((ticket) => ticket._id === selectedId),
    [detail, selectedId, tickets]
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchFilter.trim()) params.search = searchFilter.trim();
      if (fromFilter) params.from = fromFilter;
      if (toFilter) params.to = toFilter;
      if (monthFilter) params.month = monthFilter;
      if (sort) params.sort = sort;
      const response = await adminSupportAPI.getTickets(params);
      const nextTickets = response?.data?.tickets || [];
      setTickets(nextTickets);
      setSelectedId((current) => current || nextTickets[0]?._id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support queue');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, fromFilter, monthFilter, searchFilter, sort, statusFilter, toFilter]);

  const loadDetail = async (id: string) => {
    if (!id) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const response = await adminSupportAPI.getTicket(id);
      setDetail(response?.data || null);
      if (response?.data?.ticket?.status) setStatus(response.data.ticket.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket detail');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    void loadDetail(selectedId);
  }, [selectedId]);

  const refreshSelected = async () => {
    await Promise.all([loadTickets(), selectedId ? loadDetail(selectedId) : Promise.resolve()]);
  };

  const handleAssignToMe = async () => {
    if (!selectedId || !user?.id) return;
    setSubmitting(true);
    setError('');
    try {
      await adminSupportAPI.assignTicket(selectedId, user.id);
      await refreshSelected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    setError('');
    try {
      await adminSupportAPI.updateStatus(selectedId, status, reason);
      setReason('');
      await refreshSelected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await adminSupportAPI.addMessage(selectedId, reply.trim());
      setReply('');
      await refreshSelected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !note.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await adminSupportAPI.addInternalNote(selectedId, note.trim());
      setNote('');
      await loadDetail(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add internal note');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchFilter('');
    setStatusFilter('');
    setCategoryFilter('');
    setFromFilter('');
    setToFilter('');
    setMonthFilter('');
    setSort('latest');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="text.primary">Support Queue</Typography>
          <Typography color="text.secondary">Assign, investigate, reply, and keep internal notes separate.</Typography>
        </Box>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(240px, 1.3fr) repeat(3, minmax(150px, 1fr))',
              xl: 'minmax(280px, 1.5fr) repeat(6, minmax(130px, 1fr)) auto',
            },
            gap: 1.25,
            alignItems: 'center',
          }}
        >
            <TextField
              size="small"
              label="Search users or tickets"
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statuses.map((item) => (
                <MenuItem key={item.value || 'all'} value={item.value}>{item.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {SUPPORT_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>{category.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SupportTicketSort)}
            >
              {sortOptions.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Month"
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="From"
              type="date"
              value={fromFilter}
              onChange={(event) => setFromFilter(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={toFilter}
              onChange={(event) => setToFilter(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" startIcon={<Clear />} onClick={clearFilters} sx={{ height: 40, whiteSpace: 'nowrap' }}>
              Clear
            </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '390px 1fr 340px' }, gap: 2 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontWeight={900}>Queue</Typography>
          </Box>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : tickets.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <SupportAgent color="disabled" />
              <Typography color="text.secondary">No tickets match filters.</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {tickets.map((ticket) => (
                <Box
                  key={ticket._id}
                  onClick={() => setSelectedId(ticket._id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: selectedId === ticket._id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography fontWeight={850} noWrap>{ticket.subject}</Typography>
                    <SupportPriorityChip priority={ticket.priority} />
                  </Stack>
                  <Box sx={{ mt: 0.5, minWidth: 0 }}>
                    <Typography variant="body2" color="text.primary" fontWeight={800} noWrap>
                      {ticket.ownerId?.name || 'Unknown user'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {ticket.ownerId?.email || 'No email'} - {categoryLabels[ticket.category] || ticket.category}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                    <SupportStatusChip status={ticket.status} />
                    <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary', fontWeight: 800 }}>
                      {ticket.ticketNumber}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ borderRadius: 2, minHeight: 620, display: 'flex', flexDirection: 'column' }}>
          {!selectedTicket ? (
            <Box sx={{ m: 'auto', p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Select ticket.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>{selectedTicket.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedTicket.ticketNumber} - {categoryLabels[selectedTicket.category] || selectedTicket.category}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1}>
                    <SupportStatusChip status={selectedTicket.status} />
                    <SupportPriorityChip priority={selectedTicket.priority} />
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
                  User: <strong>{selectedTicket.ownerId?.name || 'Unknown user'}</strong> ({selectedTicket.ownerId?.email || 'No email'})
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                {detailLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                ) : (
                  detail?.messages?.map((message: any) => {
                    const internal = message.visibility === 'internal';
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: internal ? 'warning.light' : message.authorRole === 'admin' ? 'primary.main' : 'action.hover',
                          color: internal || message.authorRole !== 'admin' ? 'text.primary' : 'primary.contrastText',
                          border: internal ? '1px solid' : 'none',
                          borderColor: 'warning.main',
                          maxWidth: { xs: '100%', md: '82%' },
                          alignSelf: message.authorRole === 'admin' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          {internal && <Notes fontSize="small" />}
                          <Typography variant="caption" fontWeight={900}>
                            {internal ? 'Internal note' : message.authorId?.name || message.authorRole}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" whiteSpace="pre-wrap">{message.body}</Typography>
                        {message.attachments?.map((item: any) => <AttachmentPreview key={item.key} attachment={item} />)}
                      </Box>
                    );
                  })
                )}
              </Stack>

              <Box component="form" onSubmit={handleReply} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Public reply to user"
                    size="small"
                    fullWidth
                    disabled={selectedTicket.status === 'closed'}
                  />
                  <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={submitting || selectedTicket.status === 'closed'}>
                    Reply
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Paper>

        <Stack spacing={2}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={900}>Actions</Typography>
              <Button
                variant="outlined"
                startIcon={<AssignmentInd />}
                onClick={handleAssignToMe}
                disabled={!selectedTicket || submitting}
              >
                Assign To Me
              </Button>
              <Box component="form" onSubmit={handleStatus}>
                <Stack spacing={1}>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as SupportTicketStatus)}
                    disabled={!selectedTicket}
                  >
                    {statuses.filter((item) => item.value).map((item) => (
                      <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    disabled={!selectedTicket}
                  />
                  <Button type="submit" variant="contained" disabled={!selectedTicket || submitting}>
                    Update Status
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper component="form" onSubmit={handleNote} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={900}>Internal Notes</Typography>
              <TextField
                value={note}
                onChange={(event) => setNote(event.target.value)}
                multiline
                minRows={5}
                placeholder="Private investigation note"
                disabled={!selectedTicket || selectedTicket.status === 'closed'}
              />
              <Button type="submit" variant="outlined" disabled={!selectedTicket || submitting || selectedTicket.status === 'closed'}>
                Add Note
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Linked Context</Typography>
            <Typography variant="body2" color="text.secondary">
              Release: {selectedTicket?.related?.releaseId || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track: {selectedTicket?.related?.trackId || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ACRCloud: {selectedTicket?.related?.acrCloudFileId || 'None'}
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
