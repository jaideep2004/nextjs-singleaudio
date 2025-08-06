'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Tab,
  Tabs,
  TextField,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  InputAdornment,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  Refresh,
  AddCircleOutline,
  MonetizationOn,
  Info,
  AccountBalance,
  Payment,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { royaltyAPI, payoutAPI } from '@/services/api';
import { STORES } from '@/utils/constants';

// Tab panel component
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
      id={`royalty-tabpanel-${index}`}
      aria-labelledby={`royalty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Form data type for payout request
interface PayoutFormData {
  amount: number;
  paymentMethod: 'upi' | 'paypal';
  paymentDetails: string;
}

export default function RoyaltiesPage() {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [royaltyData, setRoyaltyData] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  
  // Form for payout request
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayoutFormData>({
    defaultValues: {
      amount: 0,
      paymentMethod: 'paypal',
      paymentDetails: '',
    },
  });
  
  // Load royalty data
  useEffect(() => {
    fetchRoyaltyData();
    fetchPayouts();
    fetchTracks();
  }, [currentYear, currentMonth, selectedTrack]);
  
  // Fetch royalty data
  const fetchRoyaltyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await royaltyAPI.getRoyaltyReports(currentYear, currentMonth + 1);
      
      if (response.success) {
        // Filter by track if selected
        let data = response.data || [];
        if (selectedTrack !== 'all') {
          data = data.filter((item: any) => item.trackId === selectedTrack);
        }
        
        setRoyaltyData(data);
        
        // Calculate balance
        const totalEarnings = data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        setBalance(totalEarnings);
      } else {
        setError(response.message || 'Failed to load royalty data');
      }
    } catch (error: any) {
      console.error('Error fetching royalties:', error);
      setError(error.message || 'An error occurred while fetching royalty data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch payouts
  const fetchPayouts = async () => {
    try {
      const response = await payoutAPI.getPayouts();
      
      if (response.success) {
        setPayouts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };
  
  // Fetch tracks for filtering
  const fetchTracks = async () => {
    try {
      const response = await royaltyAPI.getRoyalties();
      
      if (response.success) {
        // Extract unique tracks from royalty data
        const uniqueTracks = Array.from(
          new Set(response.data.map((item: any) => item.trackId))
        ).map((trackId) => {
          const track = response.data.find((item: any) => item.trackId === trackId);
          return {
            id: trackId,
            title: track.trackTitle,
          };
        });
        
        setTracks(uniqueTracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle month change
  const handleMonthChange = (event: any) => {
    setCurrentMonth(parseInt(event.target.value));
  };
  
  // Handle year change
  const handleYearChange = (event: any) => {
    setCurrentYear(parseInt(event.target.value));
  };
  
  // Handle track filter change
  const handleTrackChange = (event: any) => {
    setSelectedTrack(event.target.value);
  };
  
  // Handle payout form submission
  const onPayoutSubmit = async (data: PayoutFormData) => {
    try {
      setIsSubmittingPayout(true);
      setError(null);
      
      const payoutData = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
      };
      
      const response = await payoutAPI.requestPayout(payoutData);
      
      if (response.success) {
        setPayoutSuccess(true);
        setShowPayoutForm(false);
        reset();
        fetchPayouts(); // Refresh payouts
      } else {
        setError(response.message || 'Failed to submit payout request');
      }
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      setError(error.message || 'An error occurred while submitting your payout request');
    } finally {
      setIsSubmittingPayout(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Generate months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate years array (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
        return 'success';
      case 'pending': 
        return 'warning';
      case 'rejected': 
        return 'error';
      default: 
        return 'default';
    }
  };
  
  // Prepare chart data grouped by store
  const prepareStoreChartData = () => {
    const storeData: any = {};
    
    royaltyData.forEach((item: any) => {
      if (!storeData[item.store]) {
        storeData[item.store] = 0;
      }
      storeData[item.store] += item.amount || 0;
    });
    
    return Object.keys(storeData).map((store) => ({
      name: store,
      amount: storeData[store],
    }));
  };
  
  // Prepare chart data grouped by track
  const prepareTrackChartData = () => {
    const trackData: any = {};
    
    royaltyData.forEach((item: any) => {
      if (!trackData[item.trackTitle]) {
        trackData[item.trackTitle] = 0;
      }
      trackData[item.trackTitle] += item.amount || 0;
    });
    
    return Object.keys(trackData).map((track) => ({
      name: track,
      amount: trackData[track],
    }));
  };
  
  // Bar chart colors
  const COLORS = ['#3E51B5', '#F50057', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Royalties & Earnings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track your music performance and request payouts
        </Typography>
      </Box>
      
      {/* Top stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  mr: 2,
                }}
              >
                <MonetizationOn color="success" />
              </Box>
              <Box>
                <Typography variant="h4" component="div" fontWeight={700}>
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatCurrency(balance)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Balance
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Request Payout
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                onClick={() => setShowPayoutForm(true)}
                disabled={balance <= 0 || showPayoutForm}
              >
                New Request
              </Button>
            </Box>
            
            {payoutSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your payout request has been submitted successfully. You'll receive a notification when it's processed.
              </Alert>
            )}
            
            {balance <= 0 && !showPayoutForm && (
              <Alert severity="info">
                You need to have earnings before you can request a payout.
              </Alert>
            )}
            
            {showPayoutForm && (
              <form onSubmit={handleSubmit(onPayoutSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="amount"
                      control={control}
                      rules={{
                        required: 'Amount is required',
                        min: {
                          value: 1,
                          message: 'Amount must be at least $1',
                        },
                        max: {
                          value: balance,
                          message: `Amount cannot exceed your balance of ${formatCurrency(balance)}`,
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Amount"
                          type="number"
                          fullWidth
                          error={!!errors.amount}
                          helperText={errors.amount?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">$</InputAdornment>
                            ),
                          }}
                          disabled={isSubmittingPayout}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      rules={{ required: 'Payment method is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.paymentMethod}>
                          <FormLabel>Payment Method</FormLabel>
                          <RadioGroup
                            {...field}
                            row
                          >
                            <FormControlLabel
                              value="paypal"
                              control={<Radio />}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Payment sx={{ mr: 0.5 }} /> PayPal
                                </Box>
                              }
                              disabled={isSubmittingPayout}
                            />
                            <FormControlLabel
                              value="upi"
                              control={<Radio />}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccountBalance sx={{ mr: 0.5 }} /> UPI
                                </Box>
                              }
                              disabled={isSubmittingPayout}
                            />
                          </RadioGroup>
                          {errors.paymentMethod && (
                            <FormHelperText>{errors.paymentMethod.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="paymentDetails"
                      control={control}
                      rules={{ required: 'Payment details are required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={field.value === 'paypal' ? 'PayPal Email' : 'UPI ID'}
                          fullWidth
                          error={!!errors.paymentDetails}
                          helperText={errors.paymentDetails?.message}
                          disabled={isSubmittingPayout}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowPayoutForm(false);
                          reset();
                        }}
                        disabled={isSubmittingPayout}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmittingPayout}
                        startIcon={isSubmittingPayout ? <CircularProgress size={20} /> : null}
                      >
                        {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs for royalty views */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="royalty tabs"
            sx={{ px: 2, pt: 1 }}
          >
            <Tab label="Earnings Overview" id="royalty-tab-0" />
            <Tab label="Detailed Reports" id="royalty-tab-1" />
            <Tab label="Payout History" id="royalty-tab-2" />
          </Tabs>
        </Box>
        
        {/* Earnings Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="month-select-label">Month</InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={currentMonth}
                    label="Month"
                    onChange={handleMonthChange}
                  >
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="year-select-label">Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    id="year-select"
                    value={currentYear}
                    label="Year"
                    onChange={handleYearChange}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="track-select-label">Track</InputLabel>
                  <Select
                    labelId="track-select-label"
                    id="track-select"
                    value={selectedTrack}
                    label="Track"
                    onChange={handleTrackChange}
                  >
                    <MenuItem value="all">All Tracks</MenuItem>
                    {tracks.map((track) => (
                      <MenuItem key={track.id} value={track.id}>
                        {track.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchRoyaltyData}
                  sx={{ height: '100%' }}
                >
                  Refresh Data
                </Button>
                
                <Tooltip title="Download report as CSV">
                  <IconButton color="primary" sx={{ ml: 2 }}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : royaltyData.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No royalty data available for the selected period. Try a different month or year.
              </Alert>
            ) : (
              <Grid container spacing={4}>
                {/* Platform earnings chart */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Earnings by Platform
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, height: 300, bgcolor: 'background.default' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareStoreChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Earnings']}
                        />
                        <Bar dataKey="amount" fill="#3E51B5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                {/* Track earnings chart */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Earnings by Track
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, height: 300, bgcolor: 'background.default' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareTrackChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {prepareTrackChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Earnings']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>
        
        {/* Detailed Reports Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Earnings Report
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : royaltyData.length === 0 ? (
              <Alert severity="info">
                No royalty data available for the selected period.
              </Alert>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                }}
              >
                <Box sx={{ overflow: 'auto', maxHeight: 440 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <th style={{ padding: '16px', textAlign: 'left' }}>Track</th>
                        <th style={{ padding: '16px', textAlign: 'left' }}>Platform</th>
                        <th style={{ padding: '16px', textAlign: 'left' }}>Streams</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>Earnings</th>
                        <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {royaltyData.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                            backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>{item.trackTitle}</td>
                          <td style={{ padding: '12px 16px' }}>{item.store}</td>
                          <td style={{ padding: '12px 16px' }}>{item.streams.toLocaleString()}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {formatCurrency(item.amount)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {formatDate(item.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            )}
          </Box>
        </TabPanel>
        
        {/* Payout History Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payout Request History
            </Typography>
            
            {payouts.length === 0 ? (
              <Alert severity="info">
                You haven't made any payout requests yet.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {payouts.map((payout) => (
                  <Grid item xs={12} sm={6} md={4} key={payout._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          gutterBottom
                        >
                          Request #{payout._id.substring(0, 8)}
                        </Typography>
                        <Typography variant="h5" component="div" fontWeight={600}>
                          {formatCurrency(payout.amount)}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 1,
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              bgcolor: 
                                payout.status === 'approved' ? 'success.light' :
                                payout.status === 'rejected' ? 'error.light' : 'warning.light',
                              color: 
                                payout.status === 'approved' ? 'success.dark' :
                                payout.status === 'rejected' ? 'error.dark' : 'warning.dark',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {payout.status}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 'auto' }}
                          >
                            {formatDate(payout.createdAt)}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {payout.paymentMethod === 'paypal' ? 'PayPal' : 'UPI'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          Payment Details
                        </Typography>
                        <Typography variant="body1" noWrap>
                          {payout.paymentDetails}
                        </Typography>
                        
                        {payout.status === 'rejected' && payout.reason && (
                          <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }}>
                            {payout.reason}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
} 