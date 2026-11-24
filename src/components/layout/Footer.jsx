import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { setSearchQuery, resetFilters } from '../../redux/slices/searchSlice';

export default function Footer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCityClick = (cityName) => {
    dispatch(resetFilters());
    dispatch(setSearchQuery({ location: cityName, propertyType: 'All', budgetPreset: 'any' }));
    navigate(`/search?location=${encodeURIComponent(cityName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTypeClick = (type) => {
    dispatch(resetFilters());
    dispatch(setSearchQuery({ location: '', propertyType: type, budgetPreset: 'any' }));
    navigate(`/search?type=${encodeURIComponent(type)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0F172A',
        color: '#E2E8F0',
        pt: 7,
        pb: 4,
        mt: 8,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                RN
              </Box>
              <Typography variant="h6" fontWeight={800} color="#fff">
                RentNest
              </Typography>
            </Box>
            <Typography variant="body2" color="#94A3B8" sx={{ mb: 2.5, maxWidth: 340, lineHeight: 1.7 }}>
              India&apos;s trusted monthly room, PG, hostel, and co-living marketplace. Transparent
              pricing, verified stays, and flexible monthly plans without brokerage.
            </Typography>
            <Chip
              icon={<VerifiedUserOutlinedIcon sx={{ color: '#2DD4BF !important' }} />}
              label="Frontend Simulation • Demo Data"
              size="small"
              sx={{
                bgcolor: 'rgba(20, 184, 166, 0.12)',
                color: '#5EEAD4',
                border: '1px solid rgba(94, 234, 212, 0.25)',
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color="#fff" gutterBottom>
              Popular Cities
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {['Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Mumbai'].map((city) => (
                <Link
                  key={city}
                  component="button"
                  type="button"
                  onClick={() => handleCityClick(city)}
                  underline="hover"
                  sx={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.875rem', '&:hover': { color: '#fff' } }}
                >
                  PGs in {city}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color="#fff" gutterBottom>
              Stay Types
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {['PG', 'Hostel', 'Private Room', 'Shared Room', '1 BHK / 2 BHK Flats'].map((type) => (
                <Link
                  key={type}
                  component="button"
                  type="button"
                  onClick={() => handleTypeClick(type)}
                  underline="hover"
                  sx={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.875rem', '&:hover': { color: '#fff' } }}
                >
                  {type}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} color="#fff" gutterBottom>
              Kolkata Top Hubs
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {['Sector V', 'Salt Lake', 'New Town', 'Park Street', 'Jadavpur', 'Dum Dum'].map(
                (loc) => (
                  <Link
                    key={loc}
                    component="button"
                    type="button"
                    onClick={() => handleCityClick(loc)}
                    underline="hover"
                    sx={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.875rem', '&:hover': { color: '#fff' } }}
                  >
                    Stays near {loc}
                  </Link>
                )
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.16)', my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1,
          }}
        >
          <Typography variant="caption" color="#64748B">
            © {new Date().getFullYear()} RentNest. All property listings, coordinates, and bookings
            are simulated dummy data for frontend demonstration.
          </Typography>
          <Typography variant="caption" color="#64748B">
            Built with React, Redux Toolkit &amp; Material UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
