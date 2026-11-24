import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Link,
  Grid,
  MenuItem,
  Stack,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import citiesData from '../../data/cities.json';
import {
  registerUser,
  clearAuthError,
  selectAuthError,
  selectIsAuthenticated,
} from '../../redux/slices/authSlice';
import { useToast } from '../../hooks/useToast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: 'Kolkata',
      occupation: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      showToast('Account created & signed in!', 'success');
      navigate('/profile');
    }
  }, [isAuthenticated, navigate, showToast]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Create RentNest Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Register to shortlist rooms, schedule monthly stays, and manage bookings.
          </Typography>

          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
            Frontend Simulation: Registration stores your demo profile locally in localStorage.
          </Alert>

          {authError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        fullWidth
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: 'Phone is required',
                      minLength: { value: 10, message: 'Enter at least 10 digits' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Phone Number"
                        fullWidth
                        error={Boolean(errors.phone)}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Preferred City" fullWidth>
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
                    name="occupation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Occupation / College"
                        placeholder="e.g., Intern at Sector V"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        fullWidth
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="Toggle password visibility"
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: 'Please confirm password',
                      validate: (val) => val === passwordVal || 'Passwords do not match',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        fullWidth
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PersonAddOutlinedIcon />}
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={700}>
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
