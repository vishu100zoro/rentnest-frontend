import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import {
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { formatINR } from '../../utils/formatters';
import { setBookingDraft } from '../../redux/slices/bookingSlice';

const DURATION_PRESETS = [
  { value: '1', label: '1 Month' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months (Popular)' },
  { value: '11', label: '11 Months (Standard Lease)' },
  { value: 'custom', label: 'Custom Duration' },
];

export default function StickyBookingWidget({ property, selectedRoom, onSelectRoom }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [moveInDate, setMoveInDate] = useState(dayjs().add(3, 'day').format('YYYY-MM-DD'));
  const [durationPreset, setDurationPreset] = useState('6');
  const [customMonths, setCustomMonths] = useState(4);
  const [occupants, setOccupants] = useState(1);

  const durationMonths =
    durationPreset === 'custom' ? Math.max(1, Number(customMonths) || 1) : Number(durationPreset);

  const monthlyRent = selectedRoom ? selectedRoom.price : property.monthlyRent;
  const securityDeposit = property.securityDeposit || 0;
  const maintenanceCharges = property.maintenanceCharges || 0;
  const oneTimeCharges = property.oneTimeCharges || 0;
  const estimatedFirstMonth = monthlyRent + securityDeposit + maintenanceCharges + oneTimeCharges;

  const handleRequestBooking = () => {
    dispatch(
      setBookingDraft({
        propertyId: property.id,
        roomId: selectedRoom?.id || property.roomTypes?.[0]?.id,
        roomType: selectedRoom?.type || property.roomTypes?.[0]?.type || property.propertyType,
        moveInDate,
        durationMonths,
        occupants,
        monthlyRent,
        securityDeposit,
        maintenanceCharges,
        oneTimeCharges,
        totalInitialPayment: estimatedFirstMonth,
      })
    );
    navigate(`/booking/${property.id}`);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        position: { md: 'sticky' },
        top: { md: 88 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            {formatINR(monthlyRent)}
            <Typography component="span" variant="body2" color="text.secondary" fontWeight={500}>
              /month
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Zero brokerage • Refundable deposit
          </Typography>
        </Box>
        <Chip
          label={property.availabilityStatus}
          size="small"
          color={property.availabilityStatus === 'Available' ? 'success' : 'warning'}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {/* Room Type Selector */}
        <TextField
          select
          label="Selected Room Type"
          size="small"
          fullWidth
          value={selectedRoom?.id || ''}
          onChange={(e) => {
            const room = property.roomTypes.find((r) => r.id === e.target.value);
            if (room && onSelectRoom) onSelectRoom(room);
          }}
        >
          {(property.roomTypes || []).map((room) => (
            <MenuItem key={room.id} value={room.id}>
              {room.type} — {formatINR(room.price)}/mo ({room.ac ? 'AC' : 'Non-AC'})
            </MenuItem>
          ))}
        </TextField>

        {/* Move-in Date */}
        <TextField
          type="date"
          label="Move-in Date"
          size="small"
          fullWidth
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: <CalendarTodayOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        {/* Rental Duration */}
        <TextField
          select
          label="Rental Duration"
          size="small"
          fullWidth
          value={durationPreset}
          onChange={(e) => setDurationPreset(e.target.value)}
        >
          {DURATION_PRESETS.map((d) => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </TextField>

        {durationPreset === 'custom' && (
          <TextField
            type="number"
            label="Custom Duration (Months)"
            size="small"
            fullWidth
            value={customMonths}
            onChange={(e) => setCustomMonths(e.target.value)}
            inputProps={{ min: 1, max: 36 }}
          />
        )}

        {/* Occupants */}
        <TextField
          select
          label="Number of Occupants"
          size="small"
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
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {/* Price Breakdown */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Estimated First-Month Payment
      </Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Monthly Rent ({selectedRoom?.type || property.propertyType})
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
            Monthly Maintenance
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatINR(maintenanceCharges)}
          </Typography>
        </Box>
        {oneTimeCharges > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              One-Time Onboarding Fee
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatINR(oneTimeCharges)}
            </Typography>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Total Initial Payable
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Plan: {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          {formatINR(estimatedFirstMonth)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleRequestBooking}
        sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700 }}
      >
        Request Booking
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.5 }}>
        <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: 'success.main' }} />
        <Typography variant="caption" color="text.secondary">
          Instant simulation • No real payment charged
        </Typography>
      </Box>
    </Paper>
  );
}
