import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';

import ImageWithFallback from '../common/ImageWithFallback';
import AmenityIcon from '../common/AmenityIcon';
import { toggleWishlist, selectWishlistIds } from '../../redux/slices/wishlistSlice';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import amenitiesData from '../../data/amenities.json';

export default function PropertyCard({ property, compact = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistIds = useSelector(selectWishlistIds);

  const [imgIndex, setImgIndex] = useState(0);
  const images = property.images?.length ? property.images : ['/fallback-room.svg'];
  const isWishlisted = wishlistIds.includes(property.id);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlist(property.id));
    showToast(
      isWishlisted ? 'Removed from Wishlist' : `Saved ${property.name} to Wishlist`,
      isWishlisted ? 'info' : 'success'
    );
  };

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const sharingSummary = property.roomTypes
    ?.map((r) => r.type.replace(' Sharing', ''))
    .join(' / ');

  const statusColor =
    property.availabilityStatus === 'Available'
      ? 'success'
      : property.availabilityStatus === 'Filling Fast'
      ? 'warning'
      : 'error';

  const topAmenities = (property.amenities || []).slice(0, 4);

  return (
    <Card
      onClick={() => navigate(`/property/${property.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      {/* Image Carousel */}
      <Box sx={{ position: 'relative', height: { xs: 190, sm: compact ? 195 : 210, md: compact ? 195 : 220 }, overflow: 'hidden' }}>
        <ImageWithFallback
          src={images[imgIndex]}
          alt={property.name}
          sx={{ width: '100%', height: '100%', transition: 'transform 0.35s ease' }}
        />

        {/* Top Left Badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
          }}
        >
          {property.verified && (
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 15, color: '#fff !important' }} />}
              label="Verified"
              size="small"
              sx={{
                bgcolor: 'rgba(15, 118, 110, 0.92)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 24,
              }}
            />
          )}
          <Chip
            label={property.genderPreference}
            size="small"
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.78)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 24,
            }}
          />
        </Box>

        {/* Wishlist Heart */}
        <IconButton
          aria-label="Toggle wishlist"
          onClick={handleToggleWishlist}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            width: 34,
            height: 34,
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>

        {/* Carousel Arrows */}
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="Previous image"
              onClick={handlePrevImg}
              size="small"
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(15, 23, 42, 0.55)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Next image"
              onClick={handleNextImg}
              size="small"
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(15, 23, 42, 0.55)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>

            {/* Dots */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 0.6,
              }}
            >
              {images.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: idx === imgIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: idx === imgIndex ? '#fff' : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* Card Body */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Rating & Availability */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.3,
                bgcolor: '#ECFDF5',
                color: '#065F46',
                px: 0.8,
                py: 0.25,
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
              {property.rating}
            </Box>
            <Typography variant="caption" color="text.secondary">
              ({property.reviewCount} reviews)
            </Typography>
          </Box>
          <Chip
            label={property.availabilityStatus}
            size="small"
            color={statusColor}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
          />
        </Box>

        {/* Property Title */}
        <Typography variant="subtitle1" fontWeight={700} noWrap title={property.name}>
          {property.name}
        </Typography>

        {/* Locality & Address */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.4, mb: 1 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: '2px' }} />
          <Typography variant="caption" color="text.secondary" noWrap title={property.address}>
            {property.locality}, {property.city} • {property.address}
          </Typography>
        </Box>

        {/* Distance & Sharing */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
          {typeof property.distanceKm === 'number' && (
            <Chip
              icon={<NearMeOutlinedIcon sx={{ fontSize: 13 }} />}
              label={`${property.distanceKm} km away`}
              size="small"
              sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#F1F5F9' }}
            />
          )}
          <Chip
            label={property.propertyType}
            size="small"
            sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#F1F5F9' }}
          />
          {property.foodIncluded && (
            <Chip
              icon={<RestaurantIcon sx={{ fontSize: 13 }} />}
              label="Food Included"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                bgcolor: '#FFF7ED',
                color: '#C2410C',
              }}
            />
          )}
        </Stack>

        {/* Room Sharing */}
        {sharingSummary && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.25 }}>
            <strong>Rooms:</strong> {sharingSummary}
          </Typography>
        )}

        {/* Amenities mini strip */}
        {!compact && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
            {topAmenities.map((amId) => {
              const am = amenitiesData.find((a) => a.id === amId);
              return (
                <Chip
                  key={amId}
                  icon={<AmenityIcon id={amId} fontSize="inherit" />}
                  label={am ? am.shortLabel : amId}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: '0.7rem', borderColor: '#E2E8F0' }}
                />
              );
            })}
          </Box>
        )}

        <Divider sx={{ mt: 'auto', mb: 1.5 }} />

        {/* Price & Action */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.1 }}>
              {formatINR(property.monthlyRent)}
              <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
                /mo
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Deposit: {formatINR(property.securityDeposit)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${property.id}`);
            }}
            sx={{ px: 2 }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
