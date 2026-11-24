import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  Paper,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogContent,
  Rating,
  LinearProgress,
  Avatar,
  TextField,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import SubwayOutlinedIcon from '@mui/icons-material/SubwayOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ImageWithFallback from '../../components/common/ImageWithFallback';
import AmenityIcon from '../../components/common/AmenityIcon';
import StickyBookingWidget from '../../components/booking/StickyBookingWidget';
import amenitiesData from '../../data/amenities.json';
import {
  selectPropertyById,
  selectReviewsByPropertyId,
  addPropertyReview,
} from '../../redux/slices/propertySlice';
import { selectWishlistIds, toggleWishlist } from '../../redux/slices/wishlistSlice';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const property = useSelector(selectPropertyById(id));
  const reviews = useSelector(selectReviewsByPropertyId(id));
  const wishlistIds = useSelector(selectWishlistIds);
  const currentUser = useSelector(selectCurrentUser);

  const [selectedRoom, setSelectedRoom] = useState(property?.roomTypes?.[0] || null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const allPhotos = useMemo(() => {
    if (!property) return [];
    const roomImgs = (property.roomTypes || []).flatMap((r) => r.images || []);
    return Array.from(new Set([...(property.images || []), ...roomImgs]));
  }, [property]);

  const ratingDistribution = useMemo(() => {
    if (!property) return [];
    if (reviews.length > 0) {
      return [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => Math.round(r.rating) === star).length;
        return { star, pct: Math.round((count / reviews.length) * 100), count };
      });
    }
    return [
      { star: 5, pct: 68, count: Math.round(property.reviewCount * 0.68) },
      { star: 4, pct: 22, count: Math.round(property.reviewCount * 0.22) },
      { star: 3, pct: 7, count: Math.round(property.reviewCount * 0.07) },
      { star: 2, pct: 2, count: Math.round(property.reviewCount * 0.02) },
      { star: 1, pct: 1, count: Math.max(0, Math.round(property.reviewCount * 0.01)) },
    ];
  }, [property, reviews]);

  if (!property) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Property Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The listing you requested does not exist or has been removed.
        </Typography>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/search')}>
          Back to Search
        </Button>
      </Container>
    );
  }

  const activeRoom = selectedRoom || property.roomTypes?.[0] || null;
  const isWishlisted = wishlistIds.includes(property.id);

  const handleWishlist = () => {
    dispatch(toggleWishlist(property.id));
    showToast(
      isWishlisted ? 'Removed from Wishlist' : `Saved ${property.name} to Wishlist`,
      isWishlisted ? 'info' : 'success'
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    dispatch(
      addPropertyReview({
        id: `rev-${Date.now()}`,
        propertyId: property.id,
        reviewerName: currentUser?.name || 'Guest Resident',
        reviewerRole: currentUser?.occupation || 'Verified Resident',
        reviewerAvatar: currentUser?.avatar || '',
        rating: newRating,
        date: new Date().toISOString().split('T')[0],
        stayDuration: '3 months',
        comment: newComment.trim(),
        images: [],
      })
    );
    setNewComment('');
    setNewRating(5);
    showToast('Thank you! Your review has been added.', 'success');
  };

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.longitude - 0.015
  }%2C${property.latitude - 0.012}%2C${property.longitude + 0.015}%2C${
    property.latitude + 0.012
  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

  return (
    <Box sx={{ pt: { xs: 2.5, md: 4 }, pb: { xs: 11, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/search?location=${encodeURIComponent(property.city)}`)}
          >
            {property.city}
          </Link>
          <Typography color="text.primary" fontWeight={600}>
            {property.name}
          </Typography>
        </Breadcrumbs>

        {/* Title Header */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {property.verified && (
                <Chip
                  icon={<VerifiedIcon />}
                  label="RentNest Verified"
                  color="primary"
                  size="small"
                />
              )}
              <Chip label={property.propertyType} size="small" variant="outlined" />
              <Chip label={`${property.genderPreference} Stay`} size="small" color="secondary" variant="outlined" />
              <Chip label={property.furnishing} size="small" variant="outlined" />
            </Stack>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              {property.name}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {property.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                <Typography variant="body2" fontWeight={700}>
                  {property.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({property.reviewCount} reviews)
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant={isWishlisted ? 'contained' : 'outlined'}
            color={isWishlisted ? 'error' : 'inherit'}
            startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleWishlist}
          >
            {isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
          </Button>
        </Box>

        {/* Image Gallery */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={7}>
              <Box
                onClick={() => openLightbox(0)}
                sx={{
                  height: { xs: 260, sm: 360, md: 420 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <ImageWithFallback
                  src={allPhotos[0]}
                  alt={property.name}
                  sx={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Grid container spacing={1.5} sx={{ height: '100%' }}>
                {[1, 2, 3, 4].map((idx) => {
                  const photo = allPhotos[idx] || allPhotos[0];
                  return (
                    <Grid
                      item
                      xs={6}
                      key={idx}
                      sx={{ display: idx > 2 ? { xs: 'none', sm: 'block' } : 'block' }}
                    >
                      <Box
                        onClick={() => openLightbox(idx < allPhotos.length ? idx : 0)}
                        sx={{
                          height: { xs: 112, sm: 160, md: 204 },
                          borderRadius: 3,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <ImageWithFallback
                          src={photo}
                          alt={`${property.name} view ${idx + 1}`}
                          sx={{ width: '100%', height: '100%' }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="small"
            startIcon={<PhotoLibraryOutlinedIcon />}
            onClick={() => openLightbox(0)}
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              background: 'rgba(15, 23, 42, 0.85)',
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            Show all {allPhotos.length} photos
          </Button>
        </Box>

        {/* Main Content + Sticky Booking Sidebar */}
        <Grid container spacing={{ xs: 3, md: 3.5 }}>
          <Grid item xs={12} md={7} lg={8}>
            {/* Overview & Pricing Summary */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                About this property
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
                {property.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Starting Rent
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                      {formatINR(property.monthlyRent)}/mo
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Security Deposit
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {formatINR(property.securityDeposit)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Maintenance
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {formatINR(property.maintenanceCharges)}/mo
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Food Plan
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {property.foodIncluded ? 'Included' : 'Optional / Self'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {property.foodDetails && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Dining Note:</strong> {property.foodDetails}
                </Typography>
              )}
            </Paper>

            {/* Room Selection */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Choose Your Room Option
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Select a room configuration below to update your monthly rent estimate
              </Typography>

              <Grid container spacing={2}>
                {(property.roomTypes || []).map((room) => {
                  const isSelected = activeRoom?.id === room.id;
                  return (
                    <Grid item xs={12} sm={6} key={room.id}>
                      <Card
                        onClick={() => setSelectedRoom(room)}
                        sx={{
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #0F766E' : '1px solid #E2E8F0',
                          bgcolor: isSelected ? 'rgba(15, 118, 110, 0.03)' : '#fff',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box sx={{ position: 'relative', height: 150 }}>
                          <ImageWithFallback
                            src={room.images?.[0] || property.images?.[0]}
                            alt={room.type}
                            sx={{ width: '100%', height: '100%' }}
                          />
                          {isSelected && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Selected"
                              color="primary"
                              size="small"
                              sx={{ position: 'absolute', top: 10, left: 10 }}
                            />
                          )}
                          <Chip
                            label={`${room.availableBeds} beds left`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              bgcolor: 'rgba(15, 23, 42, 0.8)',
                              color: '#fff',
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                            <Typography variant="subtitle1" fontWeight={700}>
                              {room.type}
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main">
                              {formatINR(room.price)}
                              <Typography component="span" variant="caption" color="text.secondary">
                                /mo
                              </Typography>
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                            <Chip
                              icon={<BedOutlinedIcon />}
                              label={`${room.beds} ${room.beds === 1 ? 'Bed' : 'Beds'}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<AcUnitIcon />}
                              label={room.ac ? 'AC' : 'Non-AC'}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<BathtubIcon />}
                              label={room.attachedBathroom ? 'Attached Bath' : 'Common Bath'}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          <Button
                            fullWidth
                            variant={isSelected ? 'contained' : 'outlined'}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoom(room);
                            }}
                          >
                            {isSelected ? 'Selected for Booking' : 'Select This Room'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            {/* Amenities */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Amenities &amp; Facilities
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {(property.amenities || []).map((amId) => {
                  const am = amenitiesData.find((item) => item.id === amId);
                  return (
                    <Grid item xs={6} sm={4} key={amId}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          p: 1.25,
                          borderRadius: 2.5,
                          bgcolor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                        }}
                      >
                        <AmenityIcon id={amId} color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                          {am ? am.label : amId}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {property.rules?.length > 0 && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    House Rules
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {property.rules.map((rule) => (
                      <Chip key={rule} label={rule} size="small" sx={{ bgcolor: '#F1F5F9' }} />
                    ))}
                  </Stack>
                </>
              )}
            </Paper>

            {/* Location & Nearby Landmarks */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Location &amp; Connectivity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {property.address} (Simulated coordinates: {property.latitude.toFixed(4)},{' '}
                {property.longitude.toFixed(4)})
              </Typography>

              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  mb: 3,
                  height: { xs: 210, sm: 250, md: 270 },
                  bgcolor: '#F1F5F9',
                }}
              >
                <iframe
                  title={`Map of ${property.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={mapEmbedUrl}
                />
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <SubwayOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Metro Stations
                    </Typography>
                  </Stack>
                  {(property.nearbyLandmarks?.metro || []).map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <TrainOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Railway Stations
                    </Typography>
                  </Stack>
                  {(property.nearbyLandmarks?.railway || []).map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <DirectionsBusOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Bus Stops
                    </Typography>
                  </Stack>
                  {(property.nearbyLandmarks?.bus || []).map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <SchoolOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Nearby Colleges &amp; Offices
                    </Typography>
                  </Stack>
                  {(property.nearbyLandmarks?.collegesAndOffices || []).map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Paper>

            {/* Reviews & Ratings */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #E2E8F0' }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Ratings &amp; Resident Reviews
              </Typography>

              <Grid container spacing={3} alignItems="center" sx={{ my: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                      textAlign: 'center',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Typography variant="h2" fontWeight={800} color="primary.main">
                      {property.rating}
                    </Typography>
                    <Rating value={property.rating} precision={0.1} readOnly sx={{ my: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Based on {property.reviewCount} reviews
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={8}>
                  <Stack spacing={1}>
                    {ratingDistribution.map((row) => (
                      <Box key={row.star} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ width: 42 }}>
                          {row.star} ★
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={row.pct}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#E2E8F0',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ width: 38 }}>
                          {row.pct}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Written Reviews */}
              <Stack spacing={2.5}>
                {reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No written reviews yet for this stay. Be the first resident to share feedback!
                  </Typography>
                ) : (
                  reviews.map((rev) => (
                    <Box
                      key={rev.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={rev.reviewerAvatar} alt={rev.reviewerName}>
                            {rev.reviewerName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {rev.reviewerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rev.reviewerRole} • Stayed {rev.stayDuration}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Rating value={rev.rating} size="small" readOnly />
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatDate(rev.date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.65 }}>
                        {rev.comment}
                      </Typography>
                      {rev.images?.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                          {rev.images.map((img, i) => (
                            <ImageWithFallback
                              key={i}
                              src={img}
                              alt="Review photo"
                              sx={{ width: 88, height: 66, borderRadius: 2 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  ))
                )}
              </Stack>

              {/* Add Review Form */}
              <Box component="form" onSubmit={handleSubmitReview} sx={{ mt: 3.5 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Share Your Experience
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Your Rating:</Typography>
                    <Rating
                      value={newRating}
                      onChange={(_, val) => setNewRating(val || 5)}
                    />
                  </Box>
                  <TextField
                    multiline
                    rows={2}
                    placeholder="Write about room cleanliness, food, Wi-Fi, or location convenience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    fullWidth
                  />
                  <Box>
                    <Button type="submit" variant="outlined" disabled={!newComment.trim()}>
                      Post Review
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Sticky Booking Sidebar */}
          <Grid item xs={12} md={5} lg={4} id="booking-widget-section">
            <StickyBookingWidget
              property={property}
              selectedRoom={activeRoom}
              onSelectRoom={setSelectedRoom}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Sticky Mobile Bottom Booking Bar */}
      <Paper
        elevation={8}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          px: 2,
          py: 1.25,
          borderRadius: 0,
          borderTop: '1px solid #E2E8F0',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.1 }}>
            {formatINR(activeRoom ? activeRoom.price : property.monthlyRent)}
            <Typography component="span" variant="caption" color="text.secondary">
              /mo
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {activeRoom?.type || property.propertyType}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            const el = document.getElementById('booking-widget-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          sx={{ px: 2.5, flexShrink: 0 }}
        >
          Book Stay
        </Button>
      </Paper>

      {/* Lightbox Modal */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0F172A', color: '#fff', borderRadius: 3 } }}
      >
        <DialogContent sx={{ position: 'relative', p: 2 }}>
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', bgcolor: 'rgba(0,0,0,0.4)' }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ position: 'relative', height: { xs: 280, sm: 460 }, borderRadius: 2, overflow: 'hidden' }}>
            <ImageWithFallback
              src={allPhotos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              sx={{ width: '100%', height: '100%', objectFit: 'contain', bgcolor: '#0F172A' }}
            />
            {allPhotos.length > 1 && (
              <>
                <IconButton
                  onClick={() =>
                    setLightboxIndex((p) => (p === 0 ? allPhotos.length - 1 : p - 1))
                  }
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#fff',
                    bgcolor: 'rgba(0,0,0,0.55)',
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() =>
                    setLightboxIndex((p) => (p === allPhotos.length - 1 ? 0 : p + 1))
                  }
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#fff',
                    bgcolor: 'rgba(0,0,0,0.55)',
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: '#CBD5E1' }}>
            Photo {lightboxIndex + 1} of {allPhotos.length} — {property.name}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
