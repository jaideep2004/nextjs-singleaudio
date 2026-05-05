'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Save, Security, Notifications, Payment, Person } from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useColorMode } from '@/context/ColorModeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAdmin } = useAdminAuth();

  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistrations: true,
    enableEmailNotifications: true,
    currency: 'USD',
    paymentGateway: 'stripe',
    minPayoutAmount: 50,
    maxUploadSize: 50, // MB
    allowedFileTypes: ['mp3', 'wav', 'aac', 'flac'],
  });

  const [signupEnabled, setSignupEnabled] = useState(true);
  const { mode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Fetch signup setting
      const signupResponse = await adminAPI.getSetting('signupEnabled');
      console.log('Signup setting response:', signupResponse);

      if (signupResponse.success && signupResponse.data) {
        const signupValue = signupResponse.data.value;
        console.log('Signup value:', signupValue);
        setSignupEnabled(signupValue === true || signupValue === 'true');
      } else {
        // Default to true if setting not found
        setSignupEnabled(true);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      // Save signup setting
      console.log('Saving signup setting:', signupEnabled);
      const signupResponse = await adminAPI.updateSetting('signupEnabled', signupEnabled);
      console.log('Signup setting save response:', signupResponse);

      if (!signupResponse.success) {
        throw new Error(signupResponse.message || 'Failed to update signup setting');
      }

      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error?.message || 'Failed to save settings');

      // Show error message for 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  if (isAdmin === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin === false) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
          boxShadow: mode === 'dark' ? '0 16px 42px rgba(0,0,0,0.28)' : '0 14px 38px rgba(15,23,42,0.08)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)' }}
        >
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Paper>

      <Paper
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
          boxShadow: mode === 'dark' ? '0 16px 42px rgba(0,0,0,0.28)' : '0 14px 38px rgba(15,23,42,0.08)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            pt: 1,
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 54,
              borderRadius: 2,
              mx: 0.5,
              color: mode === 'dark' ? 'rgba(255,255,255,0.74)' : 'rgba(15,23,42,0.72)',
              '&.Mui-selected': {
                color: mode === 'dark' ? '#b7c5ff' : '#2841c6',
                backgroundColor: mode === 'dark' ? 'rgba(120,141,255,0.14)' : 'rgba(74,108,247,0.10)',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 999,
              backgroundColor: mode === 'dark' ? '#9bafff' : '#4a6cf7',
            },
          }}
        >
          <Tab icon={<Person />} label="General" {...a11yProps(0)} />
          <Tab icon={<Security />} label="Security" {...a11yProps(1)} />
          <Tab icon={<Notifications />} label="Notifications" {...a11yProps(2)} />
          <Tab icon={<Payment />} label="Payments" {...a11yProps(3)} />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Site Name"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Site Description"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                    name="maintenanceMode"
                    color="primary"
                  />
                }
                label="Maintenance Mode"
                sx={{ mt: 2, display: 'block' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={signupEnabled}
                      onChange={e => setSignupEnabled(e.target.checked)}
                      name="signupEnabled"
                      color="primary"
                      disabled={saving}
                    />
                  }
                  label="Allow new user registrations"
                />
                {saving && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {signupEnabled
                  ? 'New users can create accounts on the signup page.'
                  : 'New user registrations are currently disabled. Only administrators can create new accounts.'}
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Upload Size (MB)"
                name="maxUploadSize"
                value={settings.maxUploadSize}
                onChange={handleNumberInputChange}
                margin="normal"
                inputProps={{ min: 1, max: 100 }}
              />
              <TextField
                fullWidth
                label="Allowed File Types"
                name="allowedFileTypes"
                value={settings.allowedFileTypes.join(', ')}
                onChange={e => {
                  const types = e.target.value.split(',').map(t => t.trim().toLowerCase());
                  setSettings(prev => ({
                    ...prev,
                    allowedFileTypes: types,
                  }));
                }}
                margin="normal"
                helperText="Separate file types with commas (e.g., mp3, wav, aac)"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onChange={handleInputChange}
                    name="enableEmailNotifications"
                    color="primary"
                  />
                }
                label="Enable Email Notifications"
                sx={{ mt: 1, display: 'block' }}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Payment Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                select
                label="Payment Gateway"
                name="paymentGateway"
                value={settings.paymentGateway}
                onChange={handleInputChange}
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Minimum Payout Amount"
                name="minPayoutAmount"
                value={settings.minPayoutAmount}
                onChange={handleNumberInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
                inputProps={{ min: 10, step: 5 }}
              />
              <TextField
                fullWidth
                select
                label="Default Currency"
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
              </TextField>
            </Box>
          </TabPanel>

          <Divider />

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => fetchSettings()} disabled={saving}>
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
