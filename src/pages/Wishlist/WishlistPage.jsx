import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';

import PropertyCard from '../../components/property/PropertyCard';
import { selectAllProperties } from '../../redux/slices/propertySlice';
import { selectWishlistIds, clearWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../hooks/useToast';

export default function WishlistPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const properties = useSelector(selectAllProperties);
  const wishlistIds = useSelector(selectWishlistIds);

  const savedProperties = useMemo(
    () => properties.filter((p) => wishlistIds.includes(p.id)),
    [properties, wishlistIds]
  );

  const handleClear = () => {
    dispatch(clearWishlist());
    showToast('Wishlist cleared', 'info');
  };

  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Saved Stays ({savedProperties.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your shortlisted PGs, rooms, and monthly rentals persisted locally in your browser
            </Typography>
          </Box>
          {savedProperties.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={handleClear}
            >
              Clear Wishlist
            </Button>
          )}
        </Box>

        {savedProperties.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px dashed #CBD5E1',
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 54, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Your wishlist is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tap the heart icon on any property card to save and compare your favorite monthly stays.
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button variant="contained" onClick={() => navigate('/search')}>
                Explore Stays
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {savedProperties.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
