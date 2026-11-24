import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Drawer,
  Alert,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';

import SearchBar from '../../components/search/SearchBar';
import FiltersSidebar from '../../components/filters/FiltersSidebar';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyCardSkeleton from '../../components/property/PropertyCardSkeleton';
import {
  selectFilteredProperties,
  selectSearchState,
  setSortBy,
  resetFilters,
  resetAllSearch,
  clearUserLocation,
  setSearchQuery,
} from '../../redux/slices/searchSlice';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'nearest', label: 'Nearest First' },
];

export default function SearchResultsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const properties = useSelector(selectFilteredProperties);
  const searchState = useSelector(selectSearchState);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);

  // Sync initial URL parameters if user landed directly on /search?location=...&type=...
  useEffect(() => {
    const locParam = searchParams.get('location');
    const typeParam = searchParams.get('type');
    if (locParam !== null || typeParam !== null) {
      dispatch(
        setSearchQuery({
          ...(locParam !== null ? { location: locParam } : {}),
          ...(typeParam !== null ? { propertyType: typeParam } : {}),
        })
      );
    }
  }, [searchParams, dispatch]);

  // Brief skeleton feedback when sort or location changes
  useEffect(() => {
    setLoadingBrief(true);
    const timer = setTimeout(() => setLoadingBrief(false), 180);
    return () => clearTimeout(timer);
  }, [searchState.sortBy, searchState.query.location, searchState.userLocation]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <SearchBar variant="compact" />
        </Box>

        {/* Active Near Me Banner */}
        {searchState.userLocation && (
          <Alert
            severity="info"
            icon={<MyLocationIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => dispatch(clearUserLocation())}
              >
                Clear Near Me
              </Button>
            }
            sx={{ mb: 3, borderRadius: 3 }}
          >
            <strong>PGs Near Me active:</strong> Distances calculated using Haversine formula from{' '}
            <strong>{searchState.userLocation.label}</strong>
            {searchState.userLocation.isFallback
              ? ' (simulated fallback hub — sample property coordinates).'
              : ' (browser geolocation — matched against sample property coordinates).'}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Desktop & Tablet Landscape Sidebar */}
          {!isMobile && (
            <Grid item md={4} lg={3}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  position: 'sticky',
                  top: 88,
                  maxHeight: 'calc(100vh - 108px)',
                  overflowY: 'auto',
                }}
              >
                <FiltersSidebar />
              </Paper>
            </Grid>
          )}

          {/* Main Results Area */}
          <Grid item xs={12} md={8} lg={9}>
            {/* Top Bar: Count, Active Chips, Sort */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {properties.length} {properties.length === 1 ? 'Stay' : 'Stays'} Found
                  {searchState.query.location ? ` in "${searchState.query.location}"` : ''}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                  {searchState.filters.genderPreference !== 'All' && (
                    <Chip
                      label={searchState.filters.genderPreference}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {searchState.filters.foodIncluded && (
                    <Chip label="Food Included" size="small" color="secondary" variant="outlined" />
                  )}
                  {searchState.filters.propertyTypes.map((pt) => (
                    <Chip key={pt} label={pt} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={() => setMobileFiltersOpen(true)}
                    sx={{ flexShrink: 0 }}
                  >
                    Filters
                  </Button>
                )}

                <TextField
                  select
                  size="small"
                  label="Sort By"
                  value={searchState.sortBy}
                  onChange={(e) => dispatch(setSortBy(e.target.value))}
                  sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { xs: 0, sm: 195 } }}
                  InputProps={{
                    startAdornment: <SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Paper>

            {/* Results Grid */}
            {loadingBrief ? (
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={n}>
                    <PropertyCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : properties.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3.5, sm: 6 },
                  textAlign: 'center',
                  borderRadius: 4,
                  border: '1px dashed #CBD5E1',
                  bgcolor: '#FFFFFF',
                }}
              >
                <SearchOffIcon sx={{ fontSize: 54, color: 'text.secondary', mb: 1.5 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  No matching rooms or PGs found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
                  Try expanding your monthly rent range, clearing amenity filters, or searching for
                  a city like Kolkata, Bangalore, Pune, Hyderabad, or Delhi.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      dispatch(resetFilters());
                      setSearchParams({}, { replace: true });
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      dispatch(resetAllSearch());
                      setSearchParams({}, { replace: true });
                    }}
                  >
                    Show All Properties
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={property.id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: 310 } }}
      >
        <FiltersSidebar onCloseMobile={() => setMobileFiltersOpen(false)} />
      </Drawer>
    </Box>
  );
}
