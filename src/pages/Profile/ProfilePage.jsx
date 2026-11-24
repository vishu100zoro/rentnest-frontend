import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Divider,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import citiesData from '../../data/cities.json';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  updateProfile,
  logoutUser,
  loginDemoUser,
} from '../../redux/slices/authSlice';
import { selectAllBookings } from '../../redux/slices/bookingSlice';
import { selectWishlistIds } from '../../redux/slices/wishlistSlice';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const bookings = useSelector(selectAllBookings);
  const wishlistIds = useSelector(selectWishlistIds);

  const [editing, setEditing] = useState(false);

  const { control, handleSubmit } = useForm({
    values: {
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || 'Kolkata',
      occupation: user?.occupation || '',
      gender: user?.gender || 'Male',
      emergencyContact: user?.emergencyContact || '',
    },
  });

  const monthlySpendData = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'Cancelled');
    if (active.length === 0) {
      return [
        { name: 'Month 1', rent: 0 },
        { name: 'Month 2', rent: 0 },
      ];
    }
    const latest = active[0];
    return Array.from({ length: Math.min(latest.durationMonths || 6, 6) }).map((_, i) => ({
      name: `Month ${i + 1}`,
      rent:
        i === 0
          ? latest.totalInitialPayment
          : (latest.monthlyRent || 0) + (latest.maintenanceCharges || 0),
    }));
  }, [bookings]);

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0' }}
        >
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Sign in to view your Profile Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage personal details, track monthly rent bookings, and view saved properties.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
            <Button variant="outlined" onClick={() => dispatch(loginDemoUser())}>
              Try Demo User
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const upcomingCount = bookings.filter((b) => b.status === 'Upcoming').length;

  const onSaveProfile = (data) => {
    dispatch(updateProfile(data));
    setEditing(false);
    showToast('Profile updated locally!', 'success');
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Left Profile Card */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 92, height: 92, bgcolor: 'primary.main', fontSize: 32, mb: 2 }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight={800}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {user.email}
                </Typography>
                <Chip label={user.occupation || 'RentNest Member'} size="small" color="primary" variant="outlined" />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <Box
                    onClick={() => navigate('/my-bookings')}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      {upcomingCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Upcoming Stays
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    onClick={() => navigate('/wishlist')}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} color="secondary.main">
                      {wishlistIds.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Saved Stays
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Stack spacing={1.25}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarMonthOutlinedIcon />}
                  onClick={() => navigate('/my-bookings')}
                >
                  Manage My Bookings
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FavoriteBorderIcon />}
                  onClick={() => navigate('/wishlist')}
                >
                  View Wishlist
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    dispatch(logoutUser());
                    showToast('Logged out', 'info');
                    navigate('/');
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Right Personal Info & Analytics */}
          <Grid item xs={12} md={7} lg={8}>
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Personal Information
                </Typography>
                {!editing && (
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
                Simulated user profile stored in browser localStorage.
              </Alert>

              <form onSubmit={handleSubmit(onSaveProfile)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Full Name" fullWidth disabled={!editing} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Phone Number" fullWidth disabled={!editing} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="Current City" fullWidth disabled={!editing}>
                          {citiesData.map((c) => (
                            <MenuItem key={c.id} value={c.name}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="Gender" fullWidth disabled={!editing}>
                          {['Male', 'Female', 'Prefer not to say'].map((g) => (
                            <MenuItem key={g} value={g}>
                              {g}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="occupation"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Occupation / College" fullWidth disabled={!editing} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="emergencyContact"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Emergency Contact" fullWidth disabled={!editing} />
                      )}
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
                    <Button variant="outlined" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />}>
                      Save Changes
                    </Button>
                  </Stack>
                )}
              </form>
            </Paper>

            {/* Monthly Payment Schedule Chart */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Monthly Rental Outlay Projection
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Month 1 includes refundable security deposit + onboarding; subsequent months show
                recurring rent &amp; maintenance.
              </Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `₹${Math.round(val / 1000)}k`} />
                    <Tooltip formatter={(value) => formatINR(value)} />
                    <Bar dataKey="rent" fill="#0F766E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
