import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import ImageWithFallback from '../../components/common/ImageWithFallback';
import { selectAllBookings, cancelBooking } from '../../redux/slices/bookingSlice';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const bookings = useSelector(selectAllBookings);
  const [tab, setTab] = useState(0);
  const [cancelTarget, setCancelTarget] = useState(null);

  const filteredBookings = useMemo(() => {
    if (tab === 1) return bookings.filter((b) => b.status === 'Upcoming');
    if (tab === 2) return bookings.filter((b) => b.status !== 'Upcoming');
    return bookings;
  }, [bookings, tab]);

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    dispatch(cancelBooking(cancelTarget.id));
    showToast(`Booking ${cancelTarget.id} cancelled`, 'info');
    setCancelTarget(null);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
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
            <Typography variant="h4" fontWeight={800} gutterBottom>
              My Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your upcoming monthly stays, past rentals, and payment breakdowns
            </Typography>
          </Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ maxWidth: '100%', bgcolor: '#F1F5F9', borderRadius: 3, p: 0.5 }}
          >
            <Tab label={`All (${bookings.length})`} />
            <Tab label={`Upcoming (${bookings.filter((b) => b.status === 'Upcoming').length})`} />
            <Tab label={`Past / Cancelled (${bookings.filter((b) => b.status !== 'Upcoming').length})`} />
          </Tabs>
        </Box>

        {filteredBookings.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed #CBD5E1' }}
          >
            <EventAvailableOutlinedIcon sx={{ fontSize: 54, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No bookings in this view
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse verified monthly rooms and PGs to book your next stay.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/search')}>
              Find a Stay
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {filteredBookings.map((booking) => {
              const statusColor =
                booking.status === 'Upcoming'
                  ? 'success'
                  : booking.status === 'Completed'
                  ? 'primary'
                  : 'error';
              return (
                <Paper
                  key={booking.id}
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: 4, border: '1px solid #E2E8F0' }}
                >
                  <Grid container spacing={2.5} alignItems="center">
                    <Grid item xs={12} sm={3.5} md={2.5}>
                      <ImageWithFallback
                        src={booking.propertyImage}
                        alt={booking.propertyName}
                        sx={{ width: '100%', height: 140, borderRadius: 3 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8.5} md={9.5}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Chip label={booking.status} size="small" color={statusColor} />
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Ref: {booking.id}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight={700}>
                            {booking.propertyName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {booking.locality}, {booking.city} • {booking.roomType}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography variant="h6" fontWeight={800} color="primary.main">
                            {formatINR(booking.monthlyRent)}/mo
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Initial Total: {formatINR(booking.totalInitialPayment)}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Move-in Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(booking.moveInDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Plan Duration
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.durationMonths}{' '}
                            {booking.durationMonths === 1 ? 'Month' : 'Months'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityOutlinedIcon />}
                              onClick={() => navigate(`/property/${booking.propertyId}`)}
                            >
                              View Property
                            </Button>
                            {booking.status === 'Upcoming' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelOutlinedIcon />}
                                onClick={() => setCancelTarget(booking)}
                              >
                                Cancel Booking
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Booking?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel your simulated booking for{' '}
            <strong>{cancelTarget?.propertyName}</strong> (Ref: {cancelTarget?.id})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)}>Keep Booking</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel}>
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
