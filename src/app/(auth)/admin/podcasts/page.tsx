'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddLinkIcon from '@mui/icons-material/AddLink';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PremiumHeader } from '@/components/premium/PremiumSurface';
import { PodcastsContent } from '@/app/(auth)/dashboard/podcasts/page';
import { useAuth } from '@/context/AppContext';
import { isFullAdmin } from '@/lib/adminAccess';
import type { RssPodcast } from '@/types/rss';

type AssignmentUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  artistName?: string;
  permissions?: string[];
  isActive?: boolean;
};

type PodcastAssignment = {
  userId: string;
  rssPodcastId: number;
  createdAt: string;
  updatedAt: string;
};

type AssignmentResponse = {
  success: boolean;
  message?: string;
  data?: {
    podcasts: RssPodcast[];
    users: AssignmentUser[];
    assignments: PodcastAssignment[];
  };
};

async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

const getPodcastLimitForRole = (role?: string) => {
  if (role === 'admin') return Number.POSITIVE_INFINITY;
  if (role === 'subadmin') return 2;
  return 1;
};

function PodcastAssignmentPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AssignmentUser[]>([]);
  const [podcasts, setPodcasts] = useState<RssPodcast[]>([]);
  const [assignments, setAssignments] = useState<PodcastAssignment[]>([]);
  const [selectedUser, setSelectedUser] = useState<AssignmentUser | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<RssPodcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const podcastById = useMemo(
    () => new Map(podcasts.map((podcast) => [podcast.id, podcast])),
    [podcasts]
  );

  const userById = useMemo(
    () => new Map(users.map((user) => [user._id, user])),
    [users]
  );

  const selectedUserAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.userId === selectedUser?._id),
    [assignments, selectedUser]
  );

  const selectedUserLimit = getPodcastLimitForRole(selectedUser?.role);
  const alreadyAssigned = Boolean(
    selectedUser &&
      selectedPodcast &&
      selectedUserAssignments.some((assignment) => assignment.rssPodcastId === selectedPodcast.id)
  );
  const assignedElsewhere = Boolean(
    selectedPodcast &&
      assignments.some(
        (assignment) =>
          assignment.rssPodcastId === selectedPodcast.id && assignment.userId !== selectedUser?._id
      )
  );
  const userAtLimit = selectedUserAssignments.length >= selectedUserLimit;
  const canAssign = Boolean(
    selectedUser && selectedPodcast && !alreadyAssigned && !assignedElsewhere && !userAtLimit && !saving
  );
  const canShowAssignmentPanel = isFullAdmin(user);

  const loadAssignments = useCallback(async () => {
    if (!canShowAssignmentPanel) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/rss/podcast-assignments', { cache: 'no-store' });
      const json = await readJson<AssignmentResponse>(response);
      if (!json.success || !json.data) throw new Error(json.message || 'Failed to load podcast assignments');
      setUsers(json.data.users);
      setPodcasts(json.data.podcasts);
      setAssignments(json.data.assignments);
      setFeedback(null);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load podcast assignments',
      });
    } finally {
      setLoading(false);
    }
  }, [canShowAssignmentPanel]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  if (!canShowAssignmentPanel) return null;

  const handleAssign = async () => {
    if (!selectedUser || !selectedPodcast) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/rss/podcast-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, rssPodcastId: selectedPodcast.id }),
      });
      const json = await readJson<{ success: boolean; message?: string }>(response);
      if (!json.success) throw new Error(json.message || 'Failed to assign podcast');
      setFeedback({ type: 'success', message: json.message || 'Podcast assigned.' });
      setSelectedPodcast(null);
      await loadAssignments();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to assign podcast',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignment: PodcastAssignment) => {
    const key = `${assignment.userId}:${assignment.rssPodcastId}`;
    try {
      setRemovingKey(key);
      const params = new URLSearchParams({
        userId: assignment.userId,
        rssPodcastId: String(assignment.rssPodcastId),
      });
      const response = await fetch(`/api/admin/rss/podcast-assignments?${params.toString()}`, {
        method: 'DELETE',
      });
      const json = await readJson<{ success: boolean; message?: string }>(response);
      if (!json.success) throw new Error(json.message || 'Failed to remove podcast assignment');
      setFeedback({ type: 'success', message: json.message || 'Podcast assignment removed.' });
      await loadAssignments();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to remove podcast assignment',
      });
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 3,
        overflow: 'hidden',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {loading && <LinearProgress />}
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Assign Podcast
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              RSS podcast access
            </Typography>
          </Box>
          <Tooltip title="Refresh assignments">
            <span>
              <IconButton onClick={loadAssignments} disabled={loading || saving} aria-label="Refresh assignments">
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr auto' }, gap: 1.5 }}>
          <Autocomplete
            options={users}
            value={selectedUser}
            onChange={(_, value) => {
              setSelectedUser(value);
              setSelectedPodcast(null);
            }}
            getOptionLabel={(option) => `${option.name || option.email} - ${option.email}`}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => <TextField {...params} label="User" placeholder="Select user" />}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar sx={{ width: 30, height: 30 }}>{(option.name || option.email).charAt(0).toUpperCase()}</Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>{option.name || option.email}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{option.email}</Typography>
                  </Box>
                  <Chip label={option.role} size="small" variant="outlined" />
                </Stack>
              </Box>
            )}
            disabled={loading}
          />

          <Autocomplete
            options={podcasts}
            value={selectedPodcast}
            onChange={(_, value) => setSelectedPodcast(value)}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionDisabled={(option) =>
              assignments.some((assignment) => assignment.rssPodcastId === option.id)
            }
            renderInput={(params) => <TextField {...params} label="RSS podcast" placeholder="Select podcast" />}
            disabled={loading || !selectedUser}
          />

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AddLinkIcon />}
            onClick={handleAssign}
            disabled={!canAssign}
            sx={{ minHeight: 56, px: 3 }}
          >
            Assign
          </Button>
        </Box>

        {selectedUser && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1.5 }}>
            <Chip
              size="small"
              label={`${selectedUserAssignments.length}/${Number.isFinite(selectedUserLimit) ? selectedUserLimit : '∞'} assigned`}
            />
            {alreadyAssigned && <Chip color="warning" size="small" label="Already assigned" />}
            {assignedElsewhere && <Chip color="warning" size="small" label="Assigned elsewhere" />}
            {userAtLimit && !alreadyAssigned && <Chip color="error" size="small" label="Limit reached" />}
          </Stack>
        )}

        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          {assignments.length === 0 && !loading ? (
            <Typography variant="body2" color="text.secondary">
              No podcast assignments yet.
            </Typography>
          ) : (
            assignments.map((assignment) => {
              const user = userById.get(assignment.userId);
              const podcast = podcastById.get(assignment.rssPodcastId);
              const key = `${assignment.userId}:${assignment.rssPodcastId}`;

              return (
                <Box
                  key={key}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr auto', md: '1.2fr 1fr auto' },
                    gap: 1.5,
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 1.25,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {user?.name || user?.email || assignment.userId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user?.email || 'User not found'}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0, display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" noWrap>
                      {podcast?.title || `RSS podcast #${assignment.rssPodcastId}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID {assignment.rssPodcastId}
                    </Typography>
                  </Box>
                  <Tooltip title="Remove assignment">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => handleRemove(assignment)}
                        disabled={removingKey === key}
                        aria-label="Remove podcast assignment"
                      >
                        {removingKey === key ? <CircularProgress size={20} /> : <LinkOffIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            })
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

export default function AdminPodcastsPage() {
  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      <PremiumHeader
        eyebrow="Supervisor"
        title="Podcast Operations"
        description="Manage supervised podcast workspaces, publish episodes, and inspect podcast analytics directly."
      />
      <PodcastAssignmentPanel />
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
        <PodcastsContent />
      </Suspense>
    </Box>
  );
}
