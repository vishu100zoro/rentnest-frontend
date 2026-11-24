import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Switch,
  Divider,
  Button,
  Chip,
  Stack,
  Rating,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  selectSearchState,
  setFilters,
  toggleArrayFilter,
  resetFilters,
} from '../../redux/slices/searchSlice';
import { formatINR } from '../../utils/formatters';

const PROPERTY_TYPES = ['PG', 'Hostel', 'Private Room', 'Shared Room', '1 BHK', '2 BHK'];
const SHARING_OPTIONS = ['Single', 'Double', 'Triple', 'Four'];
const AMENITY_FILTERS = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'parking', label: 'Parking' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'power_backup', label: 'Power Backup' },
  { id: 'washing_machine', label: 'Washing Machine' },
  { id: 'cctv', label: 'CCTV Security' },
];

export default function FiltersSidebar({ onCloseMobile }) {
  const dispatch = useDispatch();
  const { filters } = useSelector(selectSearchState);

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Filters
        </Typography>
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={() => dispatch(resetFilters())}
        >
          Reset All
        </Button>
      </Box>

      {/* Monthly Rent Range */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Monthly Rent Range
      </Typography>
      <Typography variant="caption" color="primary.main" fontWeight={700}>
        {formatINR(filters.minRent)} – {formatINR(filters.maxRent)}
      </Typography>
      <Slider
        value={[filters.minRent, filters.maxRent]}
        onChange={(_, val) => dispatch(setFilters({ minRent: val[0], maxRent: val[1] }))}
        min={0}
        max={30000}
        step={500}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => formatINR(v)}
        sx={{ mt: 1, mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Property Type */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Property Type
      </Typography>
      <FormGroup>
        {PROPERTY_TYPES.map((type) => (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                size="small"
                checked={filters.propertyTypes.includes(type)}
                onChange={() => dispatch(toggleArrayFilter({ key: 'propertyTypes', value: type }))}
              />
            }
            label={<Typography variant="body2">{type}</Typography>}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      {/* Gender Preference */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Gender / Stay Preference
      </Typography>
      <RadioGroup
        value={filters.genderPreference}
        onChange={(e) => dispatch(setFilters({ genderPreference: e.target.value }))}
      >
        {['All', 'Boys', 'Girls', 'Unisex', 'Family'].map((pref) => (
          <FormControlLabel
            key={pref}
            value={pref}
            control={<Radio size="small" />}
            label={<Typography variant="body2">{pref === 'All' ? 'Any' : `${pref} PG / Stay`}</Typography>}
          />
        ))}
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* Room Sharing */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Room Sharing
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        {SHARING_OPTIONS.map((opt) => {
          const active = filters.roomSharing.includes(opt);
          return (
            <Chip
              key={opt}
              label={`${opt}`}
              size="small"
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              onClick={() => dispatch(toggleArrayFilter({ key: 'roomSharing', value: opt }))}
              sx={{ cursor: 'pointer' }}
            />
          );
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Furnishing */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Furnishing
      </Typography>
      <RadioGroup
        value={filters.furnishing}
        onChange={(e) => dispatch(setFilters({ furnishing: e.target.value }))}
      >
        {['All', 'Furnished', 'Semi-furnished', 'Unfurnished'].map((f) => (
          <FormControlLabel
            key={f}
            value={f}
            control={<Radio size="small" />}
            label={<Typography variant="body2">{f === 'All' ? 'Any Furnishing' : f}</Typography>}
          />
        ))}
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* AC / Non-AC */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Air Conditioning
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {['All', 'AC', 'Non-AC'].map((ac) => (
          <Chip
            key={ac}
            label={ac}
            size="small"
            color={filters.acPreference === ac ? 'primary' : 'default'}
            variant={filters.acPreference === ac ? 'filled' : 'outlined'}
            onClick={() => dispatch(setFilters({ acPreference: ac }))}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Quick Toggles */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Essential Preferences
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.foodIncluded}
              onChange={(e) => dispatch(setFilters({ foodIncluded: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">Food Included</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.attachedBathroom}
              onChange={(e) => dispatch(setFilters({ attachedBathroom: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">Attached Bathroom</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.availableOnly}
              onChange={(e) => dispatch(setFilters({ availableOnly: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">Available Rooms Only</Typography>}
        />
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      {/* Amenities */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Amenities
      </Typography>
      <FormGroup>
        {AMENITY_FILTERS.map((am) => (
          <FormControlLabel
            key={am.id}
            control={
              <Checkbox
                size="small"
                checked={filters.amenities.includes(am.id)}
                onChange={() => dispatch(toggleArrayFilter({ key: 'amenities', value: am.id }))}
              />
            }
            label={<Typography variant="body2">{am.label}</Typography>}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      {/* Distance Slider */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Max Distance from Location
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {filters.maxDistanceKm >= 50 ? 'Any distance (up to 50+ km)' : `Within ${filters.maxDistanceKm} km`}
      </Typography>
      <Slider
        value={filters.maxDistanceKm}
        onChange={(_, val) => dispatch(setFilters({ maxDistanceKm: val }))}
        min={2}
        max={50}
        step={2}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => (v >= 50 ? 'Any' : `${v} km`)}
        sx={{ mt: 1, mb: 1 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Minimum Rating */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Minimum Rating
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <Rating
          value={filters.minRating}
          precision={0.5}
          onChange={(_, val) => dispatch(setFilters({ minRating: val || 0 }))}
        />
        <Typography variant="caption" color="text.secondary">
          {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any'}
        </Typography>
      </Stack>

      {onCloseMobile && (
        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={onCloseMobile}>
          Show Results
        </Button>
      )}
    </Box>
  );
}
