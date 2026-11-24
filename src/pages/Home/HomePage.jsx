import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Stack,
  Paper,
} from '@mui/material';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoyIcon from '@mui/icons-material/Boy';
import GirlIcon from '@mui/icons-material/Girl';
import GroupsIcon from '@mui/icons-material/Groups';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import SearchBar from '../../components/search/SearchBar';
import PropertyCard from '../../components/property/PropertyCard';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import citiesData from '../../data/cities.json';
import { selectAllProperties } from '../../redux/slices/propertySlice';
import {
  setSearchQuery,
  setFilters,
  resetFilters,
  setUserLocation,
  selectSearchState,
} from '../../redux/slices/searchSlice';
import { calculateHaversineDistance } from '../../utils/distance';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const CATEGORIES = [
  {
    title: 'Boys PG',
    subtitle: 'Safe, affordable hostels & PGs with meals',
    icon: BoyIcon,
    color: '#0284C7',
    bg: '#E0F2FE',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: 'PG' }));
      dispatch(setFilters({ genderPreference: 'Boys' }));
    },
  },
  {
    title: 'Girls PG',
    subtitle: 'Biometric access & verified female wardens',
    icon: GirlIcon,
    color: '#DB2777',
    bg: '#FCE7F3',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: 'PG' }));
      dispatch(setFilters({ genderPreference: 'Girls' }));
    },
  },
  {
    title: 'Co-living Spaces',
    subtitle: 'Community lounges, Wi-Fi & flexible plans',
    icon: GroupsIcon,
    color: '#0F766E',
    bg: '#CCFBF1',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: 'All' }));
      dispatch(setFilters({ genderPreference: 'Unisex' }));
    },
  },
  {
    title: 'Private Rooms',
    subtitle: 'Single-occupancy furnished suites',
    icon: SingleBedIcon,
    color: '#7C3AED',
    bg: '#EDE9FE',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: 'Private Room' }));
    },
  },
  {
    title: 'Shared Accommodation',
    subtitle: 'Double & triple sharing budget stays',
    icon: MeetingRoomIcon,
    color: '#D97706',
    bg: '#FEF3C7',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: 'Shared Room' }));
    },
  },
  {
    title: 'Family Apartments',
    subtitle: 'Ready-to-move 1 BHK & 2 BHK monthly flats',
    icon: FamilyRestroomIcon,
    color: '#059669',
    bg: '#D1FAE5',
    apply: (dispatch) => {
      dispatch(resetFilters());
      dispatch(setSearchQuery({ location: '', propertyType: '1 BHK / 2 BHK Flats' }));
    },
  },
];

const WHY_CHOOSE = [
  {
    icon: VerifiedOutlinedIcon,
    title: 'Verified Properties',
    desc: 'Every PG, hostel, and flat undergoes a 25-point physical & hygiene check before listing.',
  },
  {
    icon: ReceiptLongOutlinedIcon,
    title: 'Transparent Monthly Pricing',
    desc: 'Clear breakdown of rent, security deposit, and maintenance with zero hidden brokerage.',
  },
  {
    icon: PhotoCameraOutlinedIcon,
    title: 'Real Property Photos',
    desc: 'Inspect multiple room angles, dining areas, and shared spaces before you visit.',
  },
  {
    icon: ReviewsOutlinedIcon,
    title: 'Genuine Resident Reviews',
    desc: 'Read verified tenant feedback on Wi-Fi stability, food quality, and safety.',
  },
  {
    icon: BoltOutlinedIcon,
    title: 'Easy Monthly Booking',
    desc: 'Pick 1, 3, 6, or 11-month plans online and track every booking in your dashboard.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const properties = useSelector(selectAllProperties);
  const { userLocation } = useSelector(selectSearchState);
  const [rentalTab, setRentalTab] = useState(0);

  const refLat = userLocation?.lat ?? 22.5726; // Default Kolkata reference
  const refLng = userLocation?.lng ?? 88.3639;

  const bestPGsNearYou = useMemo(() => {
    return properties
      .filter((p) => p.propertyType === 'PG' || p.propertyType === 'Hostel')
      .map((p) => ({
        ...p,
        distanceKm: calculateHaversineDistance(refLat, refLng, p.latitude, p.longitude),
      }))
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      .slice(0, 4);
  }, [properties, refLat, refLng]);

  const popularMonthlyRentals = useMemo(() => {
    const withDist = properties.map((p) => ({
      ...p,
      distanceKm: calculateHaversineDistance(refLat, refLng, p.latitude, p.longitude),
    }));
    if (rentalTab === 0) {
      return withDist.filter((p) => p.featured).slice(0, 4);
    }
    if (rentalTab === 1) {
      return withDist.filter((p) => p.recommended).slice(0, 4);
    }
    return [...withDist].sort((a, b) => a.monthlyRent - b.monthlyRent).slice(0, 4);
  }, [properties, rentalTab, refLat, refLng]);

  const handleCitySelect = (cityName) => {
    dispatch(resetFilters());
    dispatch(setSearchQuery({ location: cityName, propertyType: 'All', budgetPreset: 'any' }));
    navigate(`/search?location=${encodeURIComponent(cityName)}`);
  };

  const handleQuickNearMe = () => {
    if (!navigator.geolocation) {
      dispatch(
        setUserLocation({
          lat: 22.5735,
          lng: 88.4331,
          label: 'Salt Lake Sector V, Kolkata',
          isFallback: true,
        })
      );
      navigate('/search?nearMe=true');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch(
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your Current Location',
            isFallback: false,
          })
        );
        showToast('Sorted stays near your location', 'success');
        navigate('/search?nearMe=true');
      },
      () => {
        dispatch(
          setUserLocation({
            lat: 22.5735,
            lng: 88.4331,
            label: 'Salt Lake Sector V, Kolkata',
            isFallback: true,
          })
        );
        showToast('Using Sector V, Kolkata as fallback location hub', 'info');
        navigate('/search?nearMe=true');
      }
    );
  };

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 118, 110, 0.85) 100%), url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
          color: '#FFFFFF',
          pt: { xs: 5, sm: 7, md: 10 },
          pb: { xs: 6, sm: 8, md: 12 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 780, mb: 4 }}>
            <Chip
              label="Zero Brokerage • Flexible 1 to 11 Month Plans"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                color: '#CCFBF1',
                fontWeight: 600,
                mb: 2,
                backdropFilter: 'blur(6px)',
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' },
                lineHeight: 1.12,
                mb: 2,
              }}
            >
              Find Your Perfect Stay, Pay Monthly.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(241, 245, 249, 0.9)',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.6,
              }}
            >
              Discover verified PGs, hostels, co-living spaces, private rooms, and furnished monthly
              flats across Kolkata, Bangalore, Pune, Hyderabad, and Delhi.
            </Typography>
          </Box>

          <SearchBar variant="hero" />

          {/* Quick Locality Shortcuts */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            sx={{ mt: 2.5 }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              Trending in Kolkata:
            </Typography>
            {['Sector V', 'Salt Lake', 'New Town', 'Park Street', 'Jadavpur'].map((loc) => (
              <Chip
                key={loc}
                label={loc}
                size="small"
                onClick={() => handleCitySelect(loc)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Section 1: Popular Cities */}
      <Container maxWidth="xl" sx={{ mt: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Popular Cities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore curated monthly PGs, hostels &amp; apartments across India&apos;s major hubs
            </Typography>
          </Box>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/search')}>
            View All Stays
          </Button>
        </Box>

        <Grid container spacing={2.2}>
          {citiesData.map((city) => (
            <Grid item xs={6} sm={4} md={3} lg={1.5} key={city.id}>
              <Card
                onClick={() => handleCitySelect(city.name)}
                sx={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', height: 112 }}>
                  <ImageWithFallback
                    src={city.image}
                    alt={city.name}
                    sx={{ width: '100%', height: '100%' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 35%, rgba(15,23,42,0.75) 100%)',
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ position: 'absolute', bottom: 8, left: 10, color: '#fff' }}
                  >
                    {city.name}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    From {formatINR(city.startingRent)}/mo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section 2: Best PGs Near You */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Best PGs Near You
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userLocation
                ? `Sorted by distance from ${userLocation.label}`
                : 'Top-rated PGs and hostels near Kolkata city hubs — click Near Me to use your GPS'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={handleQuickNearMe}
            >
              Use Near Me
            </Button>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                dispatch(resetFilters());
                dispatch(setSearchQuery({ location: '', propertyType: 'PG' }));
                navigate('/search?type=PG');
              }}
            >
              See All PGs
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {bestPGsNearYou.map((property) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={property.id}>
              <PropertyCard property={property} compact />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section 3: Popular Monthly Rentals */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Popular Monthly Rentals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Handpicked rooms and apartments ready for immediate monthly move-in
            </Typography>
          </Box>
          <Tabs
            value={rentalTab}
            onChange={(_, v) => setRentalTab(v)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              maxWidth: '100%',
              bgcolor: '#F1F5F9',
              borderRadius: 3,
              p: 0.5,
              minHeight: 40,
              '& .MuiTab-root': { minHeight: 36, borderRadius: 2.5, px: { xs: 1.5, sm: 2 } },
            }}
          >
            <Tab label="Featured" />
            <Tab label="Recommended" />
            <Tab label="Budget-Friendly" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {popularMonthlyRentals.map((property) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section 4: Explore By Category */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Explore By Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick an accommodation style that fits your routine, privacy, and budget
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Grid item xs={6} sm={4} md={4} lg={2} key={cat.title}>
                <Card
                  onClick={() => {
                    cat.apply(dispatch);
                    navigate('/search');
                  }}
                  sx={{
                    p: 2.25,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: cat.color,
                      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      bgcolor: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.75,
                    }}
                  >
                    <IconComp />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {cat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {cat.subtitle}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Section 5: Why Choose RentNest? */}
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', mt: 9, py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              Why Choose RentNest?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Built specifically for students, interns, and working professionals seeking stress-free
              monthly accommodations.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {WHY_CHOOSE.map((item) => {
              const IconComp = item.icon;
              return (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.title}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.75,
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(15, 118, 110, 0.1)',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <IconComp />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
