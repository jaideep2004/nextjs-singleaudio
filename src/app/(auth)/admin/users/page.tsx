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
} from '@mui/material';
import { Search, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { adminAPI } from '@/services/api';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AppContext';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin } = useAdminAuth();
  
  const [mounted, setMounted] = useState(false);
  
  // Safe access to auth context
  let auth;
  let contextError = false;
  
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context not available in AdminUsersPage:", error);
    contextError = true;
  }
  
  const { user } = auth || { user: null };
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

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

  const handleCreateUser = () => {
    router.push('/admin/users/new');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleCreateUser}
        >
          Add New User
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name}</TableCell> 
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit User">
                      <IconButton onClick={() => handleEditUser(user._id)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton color="error">
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
      />
    </Box>
  );
}
