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
  Divider,
  Link,
  Stack,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import {
  loginUser,
  loginDemoUser,
  clearAuthError,
  selectAuthError,
  selectIsAuthenticated,
} from '../../redux/slices/authSlice';
import { useToast } from '../../hooks/useToast';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'aarav@rentnest.demo',
      password: 'Password@123',
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      showToast('Signed in successfully!', 'success');
      navigate('/profile');
    }
  }, [isAuthenticated, navigate, showToast]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  const handleDemoLogin = () => {
    dispatch(loginDemoUser());
  };

  return (
    <Box sx={{ py: 7 }}>
      <Container maxWidth="xs">
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Sign in to manage your bookings, profile, and saved stays.
          </Typography>

          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
            Frontend Simulation: Uses local dummy credentials (no backend auth server).
          </Alert>

          {authError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 2.5 }}>OR</Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<PersonOutlineIcon />}
            onClick={handleDemoLogin}
            sx={{ mb: 2.5 }}
          >
            One-Click Demo User Sign In
          </Button>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            New to RentNest?{' '}
            <Link component={RouterLink} to="/register" fontWeight={700}>
              Create an account
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
