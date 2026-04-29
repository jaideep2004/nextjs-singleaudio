'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Search, 
  Edit, 
  Delete, 
  PersonAdd, 
  Visibility,
  Block,
  CheckCircle
} from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AppContext';
import { useColorMode } from '@/context/ColorModeContext';

export default function AdminUsersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdmin } = useAdminAuth();
  const { mode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  // Safe access to auth context
  let auth;
  let contextError = false;

  try {
    auth = useAuth();
  } catch (error) {
    console.error('Auth context not available in AdminUsersPage:', error);
    contextError = true;
  }

  const { user } = auth || { user: null };

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect if context is not available
  useEffect(() => {
    if (mounted && contextError) {
      router.push('/login');
    }
  }, [mounted, contextError, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, page, rowsPerPage, searchTerm]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (mounted && user) {
      if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, router, mounted]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with params:', {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      });

      const response = await adminAPI.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      });

      console.log('Users API response:', response);

      if (response.success && response.data) {
        // Ensure we're getting an array of users
        const userData = response.data.users || [];
        console.log('User data array:', userData);

        if (Array.isArray(userData)) {
          setUsers(userData);
          setTotalUsers(response.data.total || response.data.pagination?.total || 0);
          console.log('Updated users state with', userData.length, 'users');
        } else {
          console.error('Users data is not an array:', userData);
          setUsers([]);
          setTotalUsers(0);
        }
      } else {
        console.warn('Invalid response format or unsuccessful response:', response);
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleCreateUser = () => {
    router.push('/admin/users/new');
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await adminAPI.deleteUser(userToDelete._id);
      if (response.success) {
        showSnackbar('User deleted successfully', 'success');
        fetchUsers(); // Refresh the user list
      } else {
        showSnackbar(response.message || 'Failed to delete user', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showSnackbar(error.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleStatusToggle = async (user: any) => {
    try {
      setUpdatingStatus(user._id);
      const newStatus = !user.isActive;
      
      const response = await adminAPI.updateUser(user._id, {
        isActive: newStatus
      });
      
      if (response.success) {
        showSnackbar(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u._id === user._id ? { ...u, isActive: newStatus } : u
          )
        );
      } else {
        showSnackbar(response.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} user`, 'error');
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      showSnackbar(error.message || 'Failed to update user status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Show loading state until client-side hydration is complete
  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If context error, show nothing (will redirect)
  if (contextError) {
    return null;
  }

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (isAdmin === false) {
    router.push('/login');
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          style={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)' }}
        >
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />} 
          onClick={handleCreateUser}
          size={isMobile ? "small" : "medium"}
        >
          {isMobile ? "Add" : "Add New User"}
        </Button>
      </Box>

      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name, email, or artist name..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'dark' ? '#9bafff' : '#4a6cf7',
              },
            },
          }}
        />
      </Paper>

      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found. Try adjusting your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow 
                  key={user._id} 
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                        {user.artistName && user.artistName !== user.name && (
                          <Typography variant="caption" color="text.secondary">
                            {user.artistName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : user.role === 'artist' ? 'secondary' : 'default'}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        minWidth: 60
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        minWidth: 60
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View User">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewUser(user._id)}
                        sx={{
                          mr: 0.5,
                          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditUser(user._id)}
                        sx={{
                          mr: 0.5,
                          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.isActive ? "Deactivate User" : "Activate User"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleStatusToggle(user)}
                        disabled={updatingStatus === user._id}
                        sx={{
                          mr: 0.5,
                          color: user.isActive 
                            ? (mode === 'dark' ? '#f44336' : '#d32f2f') 
                            : (mode === 'dark' ? '#4caf50' : '#388e3c'),
                        }}
                      >
                        {updatingStatus === user._id ? (
                          <CircularProgress size={16} />
                        ) : user.isActive ? (
                          <Block fontSize="small" />
                        ) : (
                          <CheckCircle fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.role === 'admin' && totalUsers <= 1}
                        sx={{
                          color: mode === 'dark' ? '#f44336' : '#d32f2f',
                          '&:disabled': {
                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-select': {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
          },
          '& .MuiTablePagination-displayedRows': {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-user-dialog-title"
        aria-describedby="delete-user-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: mode === 'dark' ? '#1a1a2e' : '#ffffff',
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
          }
        }}
      >
        <DialogTitle id="delete-user-dialog-title">
          Confirm User Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="delete-user-dialog-description"
            sx={{ 
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              mb: 2
            }}
          >
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?
            This action cannot be undone.
          </DialogContentText>
          {userToDelete?.role === 'admin' && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                bgcolor: mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                color: mode === 'dark' ? '#ffcc80' : '#ff9800',
              }}
            >
              This user is an administrator. Deleting admin users may affect system access.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}