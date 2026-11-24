import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Badge,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';

import { selectWishlistIds } from '../../redux/slices/wishlistSlice';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logoutUser,
} from '../../redux/slices/authSlice';
import { setSearchQuery, resetFilters } from '../../redux/slices/searchSlice';
import { useToast } from '../../hooks/useToast';
import ListPropertyModal from './ListPropertyModal';

export default function Navbar() {
  const theme = useTheme();
  const isCompactNav = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const wishlistIds = useSelector(selectWishlistIds);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  const handleExplorePGs = () => {
    dispatch(resetFilters());
    dispatch(setSearchQuery({ location: '', propertyType: 'PG', budgetPreset: 'any' }));
    navigate('/search?type=PG');
    setMobileOpen(false);
  };

  const handleMonthlyRentals = () => {
    dispatch(resetFilters());
    dispatch(setSearchQuery({ location: '', propertyType: 'All', budgetPreset: 'any' }));
    navigate('/search');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    setMobileOpen(false);
    dispatch(logoutUser());
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: <HomeOutlinedIcon fontSize="small" />,
      onClick: () => {
        navigate('/');
        setMobileOpen(false);
      },
    },
    {
      label: 'Explore PGs',
      path: '/search?type=PG',
      icon: <KingBedOutlinedIcon fontSize="small" />,
      onClick: handleExplorePGs,
    },
    {
      label: 'Monthly Rentals',
      path: '/search',
      icon: <ApartmentIcon fontSize="small" />,
      onClick: handleMonthlyRentals,
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, justifyContent: 'space-between' }}>
            {/* Brand Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 10px rgba(15, 118, 110, 0.25)',
                }}
              >
                RN
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                  }}
                >
                  Rent<Box component="span" sx={{ color: 'primary.main' }}>Nest</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1 }}>
                  Monthly Stays &amp; PGs
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation Links */}
            {!isCompactNav && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {navItems.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname + location.search === item.path;
                  return (
                    <Button
                      key={item.label}
                      onClick={item.onClick}
                      color={isActive ? 'primary' : 'inherit'}
                      sx={{
                        fontWeight: isActive ? 700 : 500,
                        px: 1.75,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: isActive ? 'rgba(15, 118, 110, 0.08)' : 'transparent',
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  startIcon={<AddHomeWorkOutlinedIcon />}
                  onClick={() => setListModalOpen(true)}
                  sx={{
                    fontWeight: 600,
                    px: 1.75,
                    py: 1,
                    color: 'secondary.dark',
                    bgcolor: 'rgba(249, 115, 22, 0.08)',
                    '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.15)' },
                  }}
                >
                  List Your Property
                </Button>
              </Box>
            )}

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                aria-label="Wishlist"
                onClick={() => navigate('/wishlist')}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 2.5,
                  width: 42,
                  height: 42,
                }}
              >
                <Badge badgeContent={wishlistIds.length} color="secondary">
                  {wishlistIds.length > 0 ? (
                    <FavoriteIcon fontSize="small" color="error" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </Badge>
              </IconButton>

              {!isCompactNav && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      <Button
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                          border: '1px solid #E2E8F0',
                          borderRadius: 3,
                          pl: 1,
                          pr: 1.75,
                          py: 0.6,
                          gap: 1,
                          color: 'text.primary',
                        }}
                      >
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 14 }}
                        >
                          {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                          {user.name.split(' ')[0]}
                        </Typography>
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 3 } }}
                      >
                        <Box sx={{ px: 2, py: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Divider />
                        <MenuItem
                          onClick={() => {
                            setAnchorEl(null);
                            navigate('/profile');
                          }}
                        >
                          <ListItemIcon>
                            <PersonOutlineIcon fontSize="small" />
                          </ListItemIcon>
                          My Profile
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAnchorEl(null);
                            navigate('/my-bookings');
                          }}
                        >
                          <ListItemIcon>
                            <CalendarMonthOutlinedIcon fontSize="small" />
                          </ListItemIcon>
                          My Bookings
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAnchorEl(null);
                            navigate('/wishlist');
                          }}
                        >
                          <ListItemIcon>
                            <FavoriteBorderIcon fontSize="small" />
                          </ListItemIcon>
                          Saved Stays ({wishlistIds.length})
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                          <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          Logout
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ px: 2 }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/register')}
                        sx={{ px: 2 }}
                      >
                        Register
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {isCompactNav && (
                <IconButton
                  aria-label="Open menu"
                  onClick={() => setMobileOpen(true)}
                  sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, width: 42, height: 42 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 290, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            Rent<Box component="span" sx={{ color: 'primary.main' }}>Nest</Box>
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isAuthenticated && user && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar src={user.avatar} sx={{ bgcolor: 'primary.main' }}>
              {user.name?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}

        <List disablePadding>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={item.onClick} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setMobileOpen(false);
                setListModalOpen(true);
              }}
              sx={{ borderRadius: 2, color: 'secondary.dark' }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'secondary.dark' }}>
                <AddHomeWorkOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="List Your Property" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate('/wishlist');
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FavoriteBorderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={`Wishlist (${wishlistIds.length})`} />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {isAuthenticated ? (
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate('/profile');
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate('/my-bookings');
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Bookings" />
              </ListItemButton>
            </ListItem>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </List>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                navigate('/register');
                setMobileOpen(false);
              }}
            >
              Create Account
            </Button>
          </Box>
        )}
      </Drawer>

      <ListPropertyModal open={listModalOpen} onClose={() => setListModalOpen(false)} />
    </>
  );
}
