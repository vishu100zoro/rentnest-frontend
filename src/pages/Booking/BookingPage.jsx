import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Divider,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import ImageWithFallback from '../../components/common/ImageWithFallback';
import { selectPropertyById } from '../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import {
  selectBookingDraft,
  createBooking,
} from '../../redux/slices/bookingSlice';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const STEPS = ['Stay & Monthly Plan', 'Occupant Details', 'Review & Confirm'];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const property = useSelector(selectPropertyById(id));
  const draft = useSelector(selectBookingDraft);
  const currentUser = useSelector(selectCurrentUser);

  const [activeStep, setActiveStep] = useState(0);
  const [confirmedBookingId, setConfirmedBookingId] = useState(null);

  const initialRoom =
    property?.roomTypes?.find((r) => r.id === draft?.roomId) ||
    property?.roomTypes?.[0] ||
    null;

  const [selectedRoomId, setSelectedRoomId] = useState(initialRoom?.id || '');
  const [moveInDate, setMoveInDate] = useState(
    draft?.moveInDate || dayjs().add(3, 'day').format('YYYY-MM-DD')
  );
  const [durationPreset, setDurationPreset] = useState(
    draft?.durationMonths && [1, 3, 6, 11].includes(draft.durationMonths)
      ? String(draft.durationMonths)
      : draft?.durationMonths
      ? 'custom'
      : '6'
  );
  const [customDuration, setCustomDuration] = useState(draft?.durationMonths || 4);
  const [occupants, setOccupants] = useState(draft?.occupants || 1);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      occupantName: currentUser?.name || '',
      occupantEmail: currentUser?.email || '',
      occupantPhone: currentUser?.phone || '',
      emergencyContact: currentUser?.emergencyContact || '',
      occupation: currentUser?.occupation || '',
      idProofType: 'Aadhaar Card',
      specialRequests: '',
    },
  });

  if (!property) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Property not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/search')}>
          Browse Properties
        </Button>
      </Container>
    );
  }

  const activeRoom =
    property.roomTypes?.find((r) => r.id === selectedRoomId) || property.roomTypes?.[0];

  const durationMonths =
    durationPreset === 'custom' ? Math.max(1, Number(customDuration) || 1) : Number(durationPreset);

  const monthlyRent = activeRoom ? activeRoom.price : property.monthlyRent;
  const securityDeposit = property.securityDeposit || 0;
  const maintenanceCharges = property.maintenanceCharges || 0;
  const oneTimeCharges = property.oneTimeCharges || 0;
  const totalInitialPayment = monthlyRent + securityDeposit + maintenanceCharges + oneTimeCharges;

  const handleConfirmBooking = () => {
    const occupantData = getValues();
    const payload = {
      propertyId: property.id,
      propertyName: property.name,
      propertyImage: property.images?.[0] || '/fallback-room.svg',
      locality: property.locality,
      city: property.city,
      roomType: activeRoom?.type || property.propertyType,
      moveInDate,
      durationMonths,
      occupants,
      monthlyRent,
      securityDeposit,
      maintenanceCharges,
      oneTimeCharges,
      totalInitialPayment,
      ...occupantData,
    };

    dispatch(createBooking(payload));
    setConfirmedBookingId(`RN-${dayjs().year()}`);
    showToast('Booking request confirmed!', 'success');
  };

  if (confirmedBookingId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid #E2E8F0',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your monthly stay at <strong>{property.name}</strong> ({activeRoom?.type}) is scheduled
            starting <strong>{formatDate(moveInDate)}</strong> for{' '}
            <strong>
              {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
            </strong>
            .
          </Typography>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              mb: 3,
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Room Configuration
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {activeRoom?.type}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Rent
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatINR(monthlyRent)}/mo
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Initial Payable (Simulated)
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                  {formatINR(totalInitialPayment)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button variant="contained" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </Button>
            <Button variant="outlined" onClick={() => navigate('/search')}>
              Explore More Stays
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/property/${property.id}`)}
          sx={{ mb: 2 }}
        >
          Back to Property
        </Button>

        <Typography variant="h4" fontWeight={800} gutterBottom>
          Complete Your Monthly Booking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Simulated booking flow — transparent monthly breakdown with zero real payment processing.
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.72rem', sm: '0.875rem' },
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Left Form Steps */}
          <Grid item xs={12} md={7} lg={7.5}>
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 4, border: '1px solid #E2E8F0' }}>
              {activeStep === 0 && (
                <Stack spacing={2.5}>
                  <Typography variant="h6" fontWeight={700}>
                    1. Confirm Room &amp; Monthly Rental Plan
                  </Typography>

                  <TextField
                    select
                    label="Room Sharing Option"
                    fullWidth
                    value={activeRoom?.id || ''}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                  >
                    {(property.roomTypes || []).map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.type} — {formatINR(room.price)}/mo ({room.ac ? 'AC' : 'Non-AC'},{' '}
                        {room.attachedBathroom ? 'Attached Bath' : 'Common Bath'})
                      </MenuItem>
                    ))}
                  </TextField>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        label="Move-in Date"
                        fullWidth
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Number of Occupants"
                        fullWidth
                        value={occupants}
                        onChange={(e) => setOccupants(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n} {n === 1 ? 'Occupant' : 'Occupants'}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" fontWeight={700}>
                    Select Rental Duration
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {[
                      { value: '1', label: '1 Month' },
                      { value: '3', label: '3 Months' },
                      { value: '6', label: '6 Months' },
                      { value: '11', label: '11 Months' },
                      { value: 'custom', label: 'Custom Duration' },
                    ].map((plan) => (
                      <Chip
                        key={plan.value}
                        label={plan.label}
                        clickable
                        color={durationPreset === plan.value ? 'primary' : 'default'}
                        variant={durationPreset === plan.value ? 'filled' : 'outlined'}
                        onClick={() => setDurationPreset(plan.value)}
                      />
                    ))}
                  </Stack>

                  {durationPreset === 'custom' && (
                    <TextField
                      type="number"
                      label="Custom Duration (Months)"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      inputProps={{ min: 1, max: 36 }}
                      sx={{ maxWidth: 240 }}
                    />
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    <Button variant="contained" size="large" onClick={() => setActiveStep(1)}>
                      Continue to Occupant Details
                    </Button>
                  </Box>
                </Stack>
              )}

              {activeStep === 1 && (
                <form onSubmit={handleSubmit(() => setActiveStep(2))}>
                  <Stack spacing={2.25}>
                    <Typography variant="h6" fontWeight={700}>
                      2. Occupant Details
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="occupantName"
                          control={control}
                          rules={{ required: 'Full name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Full Name"
                              fullWidth
                              error={Boolean(errors.occupantName)}
                              helperText={errors.occupantName?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="occupantPhone"
                          control={control}
                          rules={{
                            required: 'Phone number is required',
                            minLength: { value: 10, message: 'Enter a valid phone number' },
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone Number"
                              fullWidth
                              error={Boolean(errors.occupantPhone)}
                              helperText={errors.occupantPhone?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="occupantEmail"
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
                              error={Boolean(errors.occupantEmail)}
                              helperText={errors.occupantEmail?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="occupation"
                          control={control}
                          rules={{ required: 'College or company is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="College / Company"
                              fullWidth
                              error={Boolean(errors.occupation)}
                              helperText={errors.occupation?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="idProofType"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} select label="ID Verification Type" fullWidth>
                              {['Aadhaar Card', 'Passport', 'Driving License', 'College / Work ID'].map(
                                (idType) => (
                                  <MenuItem key={idType} value={idType}>
                                    {idType}
                                  </MenuItem>
                                )
                              )}
                            </TextField>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="emergencyContact"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} label="Emergency Contact (Optional)" fullWidth />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="specialRequests"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Special Move-in Notes (Optional)"
                              multiline
                              rows={2}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1.5, pt: 1 }}>
                      <Button variant="outlined" onClick={() => setActiveStep(0)}>
                        Back
                      </Button>
                      <Button type="submit" variant="contained" size="large">
                        Review Booking Summary
                      </Button>
                    </Box>
                  </Stack>
                </form>
              )}

              {activeStep === 2 && (
                <Stack spacing={2.5}>
                  <Typography variant="h6" fontWeight={700}>
                    3. Review &amp; Confirm Monthly Booking
                  </Typography>

                  <Alert severity="info" icon={<LockOutlinedIcon />} sx={{ borderRadius: 2.5 }}>
                    Frontend Simulation: Clicking Confirm Booking creates a simulated reservation in
                    your local My Bookings dashboard without charging any card or payment gateway.
                  </Alert>

                  <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Resident &amp; Stay Summary
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Occupant
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {getValues('occupantName')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {getValues('occupantPhone')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Move-in Date
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(moveInDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Plan Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {durationMonths} {durationMonths === 1 ? 'Month' : 'Months'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Button variant="outlined" onClick={() => setActiveStep(1)}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      onClick={handleConfirmBooking}
                    >
                      Confirm Booking
                    </Button>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Grid>

          {/* Right Summary Card */}
          <Grid item xs={12} md={5} lg={4.5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                position: { md: 'sticky' },
                top: { md: 88 },
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <ImageWithFallback
                  src={property.images?.[0]}
                  alt={property.name}
                  sx={{ width: 88, height: 76, borderRadius: 2.5, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {property.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {property.locality}, {property.city}
                  </Typography>
                  <Chip
                    label={activeRoom?.type || property.propertyType}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.75, height: 22 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Transparent Monthly Breakdown
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Rent
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatINR(monthlyRent)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Security Deposit (Refundable)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatINR(securityDeposit)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance Charges
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatINR(maintenanceCharges)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    One-Time Charges
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatINR(oneTimeCharges)}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Total Initial Payment
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subsequent months: {formatINR(monthlyRent + maintenanceCharges)}/mo
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {formatINR(totalInitialPayment)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
