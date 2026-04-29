'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Switch,
  FormGroup,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { adminAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useColorMode } from '@/context/ColorModeContext';
import ViewUser from './components/ViewUser';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`,
  };
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useColorMode();
  const { isAdmin } = useAdminAuth();
  
  // For Next.js App Router, params is already resolved
  const userId = params.id;
  
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'artist',
    artistName: '',
    isActive: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin && userId) {
      fetchUser();
    }
  }, [isAdmin, userId]);

  const fetchUser = async () => {
    try {
      setFetching(true);
      const response = await adminAPI.getUserById(userId);
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'artist',
          artistName: userData.artistName || '',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Validate form
      if (!formData.name || !formData.email) {
        throw new Error('Please fill in all required fields');
      }
      
      // Update user
      const response = await adminAPI.updateUser(userId, formData);
      
      if (response.success) {
        setSuccess(true);
        // Refresh the user data
        fetchUser();
        // Switch to view tab
        setTabValue(0);
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = () => {
    fetchUser();
  };

  if (isAdmin === null || fetching) {
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

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/admin/dashboard">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/admin/users">
            Users
          </MuiLink>
          <Typography color="text.primary">User Details</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            component={Link}
            href="/admin/users"
          >
            Back to Users
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User updated successfully!
        </Alert>
      )}

      <Paper 
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="user tabs"
          sx={{
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            '& .MuiTab-root': {
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              '&.Mui-selected': {
                color: mode === 'dark' ? '#9bafff' : '#4a6cf7',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: mode === 'dark' ? '#9bafff' : '#4a6cf7',
            },
          }}
        >
          <Tab label="View User" {...a11yProps(0)} />
          <Tab label="Edit User" {...a11yProps(1)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <ViewUser user={user} onUserUpdate={handleUserUpdate} onEdit={() => setTabValue(1)} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Artist Name"
              name="artistName"
              value={formData.artistName}
              onChange={handleChange}
              margin="normal"
              helperText="This is the public name for the artist"
              sx={{ mb: 2 }}
            />
            
            <FormControl component="fieldset" margin="normal" sx={{ mb: 2 }}>
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel value="artist" control={<Radio />} label="Artist" />
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" margin="normal" sx={{ mb: 3 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active User"
                />
              </FormGroup>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/users"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </TabPanel>
      </Paper>
    </Box>
  );
}