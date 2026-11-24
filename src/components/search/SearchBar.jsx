import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Autocomplete,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import citiesData from '../../data/cities.json';
import {
  setSearchQuery,
  setUserLocation,
  clearUserLocation,
  selectSearchState,
} from '../../redux/slices/searchSlice';
import { FALLBACK_HUBS } from '../../utils/distance';
import { useToast } from '../../hooks/useToast';

const PROPERTY_TYPE_OPTIONS = [
  'All',
  'PG',
  'Hostel',
  'Private Room',
  'Shared Room',
  '1 BHK / 2 BHK Flats',
];

const BUDGET_OPTIONS = [
  { value: 'any', label: 'Any Budget' },
  { value: 'under_7000', label: 'Under ₹7,000 / mo' },
  { value: '7000_10000', label: '₹7,000 – ₹10,000 / mo' },
  { value: '10000_15000', label: '₹10,000 – ₹15,000 / mo' },
  { value: 'above_15000', label: '₹15,000+ / mo' },
];

export default function SearchBar({ variant = 'hero' }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const searchState = useSelector(selectSearchState);

  const [locationInput, setLocationInput] = useState(searchState.query.location || '');
  const [propertyType, setPropertyType] = useState(searchState.query.propertyType || 'All');
  const [budgetPreset, setBudgetPreset] = useState(searchState.query.budgetPreset || 'any');
  const [moveInDate, setMoveInDate] = useState(
    searchState.query.moveInDate || dayjs().add(3, 'day').format('YYYY-MM-DD')
  );
  const [locating, setLocating] = useState(false);
  const [fallbackDialogOpen, setFallbackDialogOpen] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState('');

  useEffect(() => {
    setLocationInput(searchState.query.location || '');
    setPropertyType(searchState.query.propertyType || 'All');
    setBudgetPreset(searchState.query.budgetPreset || 'any');
    setMoveInDate(searchState.query.moveInDate || dayjs().add(3, 'day').format('YYYY-MM-DD'));
  }, [
    searchState.query.location,
    searchState.query.propertyType,
    searchState.query.budgetPreset,
    searchState.query.moveInDate,
  ]);

  const locationSuggestions = useMemo(() => {
    const list = [];
    citiesData.forEach((city) => {
      list.push(city.name);
      city.popularLocalities.forEach((loc) => {
        list.push(`${loc}, ${city.name}`);
      });
    });
    return list;
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    dispatch(clearUserLocation());
    dispatch(
      setSearchQuery({
        location: locationInput,
        propertyType,
        budgetPreset,
        moveInDate,
      })
    );
    const params = new URLSearchParams();
    if (locationInput.trim()) params.set('location', locationInput.trim());
    if (propertyType !== 'All') params.set('type', propertyType);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleNearMeClick = () => {
    if (!navigator.geolocation) {
      setGeoErrorMsg('Browser geolocation is unavailable. Pick a city hub to simulate Near Me.');
      setFallbackDialogOpen(true);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        dispatch(
          setUserLocation({
            lat: latitude,
            lng: longitude,
            label: 'Your Current Location',
            isFallback: false,
          })
        );
        dispatch(
          setSearchQuery({
            location: '',
            propertyType,
            budgetPreset,
            moveInDate,
          })
        );
        setLocationInput('');
        showToast('Showing stays sorted nearest to your coordinates', 'success');
        navigate('/search?nearMe=true');
      },
      (err) => {
        setLocating(false);
        setGeoErrorMsg(
          err.code === 1
            ? 'Location permission was denied. Select a nearby hub below to simulate distance sorting:'
            : 'Could not determine your GPS coordinates. Choose a hub below:'
        );
        setFallbackDialogOpen(true);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleSelectFallbackHub = (hub) => {
    setFallbackDialogOpen(false);
    dispatch(
      setUserLocation({
        lat: hub.lat,
        lng: hub.lng,
        label: hub.label,
        isFallback: true,
      })
    );
    dispatch(
      setSearchQuery({
        location: hub.city,
        propertyType,
        budgetPreset,
        moveInDate,
      })
    );
    setLocationInput(hub.city);
    showToast(`Showing stays sorted by distance from ${hub.label}`, 'info');
    navigate(`/search?nearMe=true&hub=${encodeURIComponent(hub.label)}`);
  };

  const isHero = variant === 'hero';

  return (
    <>
      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={isHero ? 6 : 1}
        sx={{
          p: isHero ? { xs: 2, md: 2.5 } : { xs: 1.5, md: 2 },
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: isHero
            ? '0 20px 50px rgba(15, 23, 42, 0.14)'
            : '0 4px 16px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          {/* Location Field + Near Me Button */}
          <Grid item xs={12} md={6} lg={4}>
            <Autocomplete
              freeSolo
              options={locationSuggestions}
              inputValue={locationInput}
              onInputChange={(_, newValue) => setLocationInput(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City or Locality"
                  placeholder="e.g., Sector V, Salt Lake, Kolkata"
                  size={isHero ? 'medium' : 'small'}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="PGs Near Me (uses browser location)">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleNearMeClick}
                            disabled={locating}
                            sx={{
                              bgcolor: 'rgba(15, 118, 110, 0.08)',
                              borderRadius: 1.5,
                              px: 1,
                              gap: 0.5,
                              display: { xs: 'none', sm: 'inline-flex' },
                            }}
                          >
                            {locating ? (
                              <CircularProgress size={16} />
                            ) : (
                              <>
                                <MyLocationIcon fontSize="small" />
                                <Typography variant="caption" fontWeight={700}>
                                  Near Me
                                </Typography>
                              </>
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Property Type */}
          <Grid item xs={12} sm={6} md={6} lg={2.2}>
            <TextField
              select
              label="Property Type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              size={isHero ? 'medium' : 'small'}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeWorkOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {PROPERTY_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Monthly Budget */}
          <Grid item xs={12} sm={6} md={4} lg={2.2}>
            <TextField
              select
              label="Monthly Budget"
              value={budgetPreset}
              onChange={(e) => setBudgetPreset(e.target.value)}
              size={isHero ? 'medium' : 'small'}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {BUDGET_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Move-in Date */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              type="date"
              label="Move-in Date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              size={isHero ? 'medium' : 'small'}
              fullWidth
              inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Search & Mobile Near Me Actions */}
          <Grid item xs={12} sm={6} md={4} lg={1.6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={handleNearMeClick}
                disabled={locating}
                startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  height: isHero ? 48 : 40,
                  flexShrink: 0,
                  px: 1.75,
                  fontWeight: 700,
                }}
              >
                Near Me
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size={isHero ? 'large' : 'medium'}
                startIcon={<SearchIcon />}
                sx={{ height: isHero ? { xs: 48, md: 54 } : 40, fontWeight: 700 }}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fallback Hub Dialog for Near Me */}
      <Dialog
        open={fallbackDialogOpen}
        onClose={() => setFallbackDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Choose Reference Hub</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {geoErrorMsg}
          </Typography>
          <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <List dense>
              {FALLBACK_HUBS.map((hub) => (
                <ListItemButton key={hub.label} onClick={() => handleSelectFallbackHub(hub)}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <LocationOnOutlinedIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={hub.label}
                    secondary={`Simulated reference (${hub.lat.toFixed(2)}, ${hub.lng.toFixed(2)})`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFallbackDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
