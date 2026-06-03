'use client';

import { useState, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Alert,
  MenuItem,
} from '@mui/material';
import { 
  Edit, 
  Block, 
  CheckCircle,
  Email,
  Person,
  CalendarToday,
  VerifiedUser,
  Cancel,
  Visibility,
  Close,
  FactCheck,
  ImageOutlined,
} from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import { useColorMode } from '@/context/ColorModeContext';
import Link from 'next/link';

const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const toAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  if (value.startsWith('/uploads')) return `${backendBaseUrl}${value}`;
  return value;
};

const formatLabel = (value: string) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const DetailGrid = ({ items }: { items: Array<[string, any]> }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25 }}>
    {items.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) => (
      <Box key={label} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'rgba(15,23,42,0.04)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{String(value)}</Typography>
      </Box>
    ))}
  </Box>
);

const buildKycDraft = (user: any) => {
  const payout = user.payoutMethod || user.onboarding?.payoutMethod || {};
  const details = payout.details || {};
  return {
    accountType: user.accountType || user.role || '',
    artistName: user.artistName || '',
    legalName: user.onboarding?.legalName || user.onboarding?.labelLegalName || '',
    labelName: user.onboarding?.labelName || '',
    phoneNumber: user.onboarding?.phoneNumber || user.verification?.phoneNumber || '',
    country: user.onboarding?.location?.country || '',
    state: user.onboarding?.location?.state || '',
    city: user.onboarding?.location?.city || '',
    pincode: user.onboarding?.location?.pincode || '',
    address: user.onboarding?.location?.address || user.onboarding?.legalAddress || '',
    aadhaarNumber: user.onboarding?.aadhaarNumber || '',
    panNumber: user.onboarding?.panNumber || '',
    idNumber: user.onboarding?.idNumber || '',
    registrationType: user.onboarding?.registrationType || '',
    payoutMethod: payout.method || 'bank_transfer',
    accountHolderName: details.accountHolderName || '',
    accountNumber: details.accountNumber || '',
    ifscCode: details.ifscCode || '',
    bankName: details.bankName || '',
    branch: details.branch || '',
    paypalEmail: details.paypalEmail || '',
  };
};

export default function ViewUser({ user, onUserUpdate, onEdit }: { user: any; onUserUpdate: () => void; onEdit?: () => void }) {
  const { mode } = useColorMode();
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reviewingKyc, setReviewingKyc] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [kycDraft, setKycDraft] = useState<Record<string, string>>(() => buildKycDraft(user));
  const [savingKycDetails, setSavingKycDetails] = useState(false);
  const [kycEditError, setKycEditError] = useState('');
  const [kycEditSuccess, setKycEditSuccess] = useState('');

  const handleStatusToggle = async () => {
    try {
      setUpdatingStatus(true);
      const newStatus = !user.isActive;
      
      const response = await adminAPI.updateUser(user._id, {
        isActive: newStatus
      });
      
      if (response.success) {
        onUserUpdate();
      }
    } catch (err: any) {
      console.error('Error updating user status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleKycReview = async (status: 'approved' | 'rejected') => {
    try {
      setReviewingKyc(true);
      const response = await adminAPI.reviewUserVerification(user._id, {
        status,
        rejectionReason: status === 'rejected' ? 'KYC details need correction. Please resubmit with valid information.' : undefined,
      });
      if (response.success) onUserUpdate();
    } catch (err: any) {
      console.error('Error updating KYC status:', err);
    } finally {
      setReviewingKyc(false);
    }
  };

  const openKycFile = () => {
    setKycDraft(buildKycDraft(user));
    setKycEditError('');
    setKycEditSuccess('');
    setKycOpen(true);
  };

  const handleDraftChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setKycDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSaveKycDetails = async () => {
    try {
      setSavingKycDetails(true);
      setKycEditError('');
      setKycEditSuccess('');

      const nextPayoutMethod = {
        method: kycDraft.payoutMethod || 'bank_transfer',
        details: {
          accountHolderName: kycDraft.accountHolderName,
          accountNumber: kycDraft.accountNumber,
          ifscCode: kycDraft.ifscCode,
          bankName: kycDraft.bankName,
          branch: kycDraft.branch,
          paypalEmail: kycDraft.paypalEmail,
        },
      };

      const response = await adminAPI.updateUser(user._id, {
        accountType: kycDraft.accountType,
        artistName: kycDraft.artistName,
        onboarding: {
          ...(user.onboarding || {}),
          legalName: kycDraft.legalName,
          labelName: kycDraft.labelName,
          phoneNumber: kycDraft.phoneNumber,
          aadhaarNumber: kycDraft.aadhaarNumber,
          panNumber: kycDraft.panNumber,
          idNumber: kycDraft.idNumber,
          registrationType: kycDraft.registrationType,
          payoutMethod: nextPayoutMethod,
          location: {
            ...(user.onboarding?.location || {}),
            country: kycDraft.country,
            state: kycDraft.state,
            city: kycDraft.city,
            pincode: kycDraft.pincode,
            address: kycDraft.address,
          },
        },
        payoutMethod: nextPayoutMethod,
        verification: {
          ...(user.verification || {}),
          phoneNumber: kycDraft.phoneNumber,
          lastEditedByAdminAt: new Date().toISOString(),
        },
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to save KYC details');
      }

      setKycEditSuccess('KYC details saved.');
      onUserUpdate();
    } catch (err: any) {
      setKycEditError(err?.message || 'Failed to save KYC details');
    } finally {
      setSavingKycDetails(false);
    }
  };

  const verificationStatus = user.verification?.status || 'pending';
  const kycHeadingName =
    user.accountType === 'label' || user.role === 'label'
      ? user.onboarding?.legalName || user.onboarding?.labelLegalName || user.name
      : user.artistName || user.name;
  const verificationColor =
    verificationStatus === 'approved' ? 'success' :
    verificationStatus === 'rejected' ? 'error' :
    verificationStatus === 'submitted' ? 'warning' :
    'info';
  const profilePicture = toAssetUrl(user.profilePicture);

  return (  
    <Box>
      {/* User Header */}   
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        {profilePicture ? (
          <Box
            component="img"
            src={profilePicture}
            alt={`${user.name} profile`}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              mr: 3,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: mode === 'dark' ? 'primary.dark' : 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              color: 'white',
              fontWeight: 600,
              fontSize: '2rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Box>
        )}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            {user.name}
          </Typography>
          {user.artistName && user.artistName !== user.name && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Artist Name: {user.artistName}
            </Typography>
          )}
          <Chip
            label={user.role}
            color={user.role === 'admin' ? 'primary' : 'secondary'}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={user.isActive ? 'Active' : 'Inactive'}
            color={user.isActive ? 'success' : 'default'}
            size="small"
          />
          <Chip
            label={`KYC ${verificationStatus}`}
            color={verificationColor as any}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>

      {user.role !== 'admin' && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h6" fontWeight={700}>KYC Review</Typography>
              <Typography variant="body2" color="text.secondary">
                Provider: {user.verification?.kycProvider || 'Not selected'} | Mobile: {user.verification?.mobileProvider || 'Not selected'}
              </Typography>
              {user.verification?.rejectionReason && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {user.verification.rejectionReason}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                color="info"
                startIcon={<FactCheck />}
                onClick={openKycFile}
              >
                Review KYC File
              </Button>
              <Button
                component={Link}
                href={`/admin/users/${user._id}/preview`}
                variant="outlined"
                startIcon={<Visibility />}
              >
                View As User
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={reviewingKyc ? <CircularProgress size={18} /> : <VerifiedUser />}
                disabled={reviewingKyc || verificationStatus === 'approved'}
                onClick={() => handleKycReview('approved')}
              >
                Approve KYC
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                disabled={reviewingKyc || verificationStatus === 'rejected'}
                onClick={() => handleKycReview('rejected')}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Dialog open={kycOpen} onClose={() => setKycOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pr: 7 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <FactCheck color="info" />
            <Box>
              <Typography variant="h6" fontWeight={900}>Manual KYC file - {kycHeadingName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.name} - {user.email}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setKycOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: mode === 'dark' ? '#111827' : '#f8fafc' }}>
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography fontWeight={900}>Editable admin details</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Changes update profile, address, identity, and payout data.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={savingKycDetails ? <CircularProgress size={16} color="inherit" /> : <Edit />}
                  onClick={handleSaveKycDetails}
                  disabled={savingKycDetails}
                  sx={{ alignSelf: { xs: 'stretch', md: 'center' }, borderRadius: 2, fontWeight: 850 }}
                >
                  Save Details
                </Button>
              </Stack>
              {kycEditError ? <Alert severity="error" sx={{ mb: 2 }}>{kycEditError}</Alert> : null}
              {kycEditSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{kycEditSuccess}</Alert> : null}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                {[
                  ['artistName', 'Artist name'],
                  ['legalName', 'Legal name'],
                  ['labelName', 'Label name'],
                  ['phoneNumber', 'Phone'],
                  ['country', 'Country'],
                  ['state', 'State'],
                  ['city', 'City'],
                  ['pincode', 'Pincode'],
                  ['address', 'Address'],
                  ['aadhaarNumber', 'Aadhaar'],
                  ['panNumber', 'PAN'],
                  ['idNumber', 'National ID'],
                  ['registrationType', 'Registration type'],
                  ['accountHolderName', 'Account holder'],
                  ['accountNumber', 'Account number'],
                  ['ifscCode', 'IFSC'],
                  ['bankName', 'Bank name'],
                  ['branch', 'Branch'],
                  ['paypalEmail', 'PayPal email'],
                ].map(([field, label]) => (
                  <TextField
                    key={field}
                    label={label}
                    value={kycDraft[field] || ''}
                    onChange={handleDraftChange(field)}
                    size="small"
                    fullWidth
                  />
                ))}
                <TextField
                  select
                  label="Account type"
                  value={kycDraft.accountType || ''}
                  onChange={handleDraftChange('accountType')}
                  size="small"
                  fullWidth
                >
                  {['artist', 'label', 'admin', 'subadmin'].map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Payout method"
                  value={kycDraft.payoutMethod || 'bank_transfer'}
                  onChange={handleDraftChange('payoutMethod')}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="bank_transfer">Bank transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </TextField>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1.5 }}>Profile and address</Typography>
              <DetailGrid
                items={[
                  ['Account type', user.accountType || user.role],
                  ['Region', user.onboarding?.region],
                  ['Artist name', user.artistName],
                  ['Label name', user.onboarding?.labelName],
                  ['Legal name', user.onboarding?.legalName],
                  ['Phone', user.onboarding?.phoneNumber || user.verification?.phoneNumber],
                  ['Country', user.onboarding?.location?.country],
                  ['State', user.onboarding?.location?.state],
                  ['City', user.onboarding?.location?.city],
                  ['Pincode', user.onboarding?.location?.pincode],
                  ['Address', user.onboarding?.location?.address || user.onboarding?.legalAddress],
                ]}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1.5 }}>Identity</Typography>
              <DetailGrid
                items={[
                  ['Aadhaar', user.onboarding?.aadhaarNumber],
                  ['PAN', user.onboarding?.panNumber],
                  ['National ID', user.onboarding?.idNumber],
                  ['Registration type', user.onboarding?.registrationType],
                  ['Total artists', user.onboarding?.totalArtists],
                  ['Catalog size', user.onboarding?.catalogSize],
                  ['Rights type', user.onboarding?.rightsType],
                ]}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1.5 }}>Payout</Typography>
              <DetailGrid
                items={[
                  ['Method', user.payoutMethod?.method || user.onboarding?.payoutMethod?.method],
                  ['Account holder', user.payoutMethod?.details?.accountHolderName],
                  ['Account number', user.payoutMethod?.details?.accountNumber],
                  ['IFSC', user.payoutMethod?.details?.ifscCode],
                  ['Bank', user.payoutMethod?.details?.bankName],
                  ['Branch', user.payoutMethod?.details?.branch],
                  ['PayPal email', user.payoutMethod?.details?.paypalEmail],
                ]}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <ImageOutlined color="info" />
                <Typography fontWeight={900}>Document previews</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                {Object.entries(user.onboarding?.documents || {}).filter(([, value]) => value).map(([key, value]) => {
                  const url = toAssetUrl(String(value));
                  const isPdf = url.toLowerCase().includes('.pdf');
                  return (
                    <Box key={key} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
                      <Box sx={{ height: 190, bgcolor: 'rgba(15,23,42,0.06)', display: 'grid', placeItems: 'center' }}>
                        {isPdf ? (
                          <Button component="a" href={url} target="_blank" rel="noreferrer" variant="outlined">Open PDF</Button>
                        ) : (
                          <Box component="img" src={url} alt={formatLabel(key)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </Box>
                      <Divider />
                      <Typography sx={{ p: 1.25, fontWeight: 800 }}>{formatLabel(key)}</Typography>
                    </Box>
                  );
                })}
                {Object.values(user.onboarding?.documents || {}).filter(Boolean).length === 0 && (
                  <Typography color="text.secondary">No uploaded documents found.</Typography>
                )}
              </Box>
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* User Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          User Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email Address
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" textTransform="capitalize">
                {user.role}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Joined Date
              </Typography>
              <Typography variant="body1">
                {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
          
          {user.lastLogin && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {new Date(user.lastLogin).toLocaleDateString()} at {new Date(user.lastLogin).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={onEdit}
        >
          Edit User
        </Button>
        
        <Button
          variant="contained"
          startIcon={updatingStatus ? <CircularProgress size={20} /> : user.isActive ? <Block /> : <CheckCircle />}
          onClick={handleStatusToggle}
          disabled={updatingStatus}
          color={user.isActive ? 'error' : 'success'}
        >
          {updatingStatus 
            ? 'Updating...' 
            : user.isActive 
              ? 'Deactivate User' 
              : 'Activate User'}
        </Button>
      </Box>
    </Box>
  );
}
