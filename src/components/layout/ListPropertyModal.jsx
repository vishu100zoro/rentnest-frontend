import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import citiesData from '../../data/cities.json';
import { addPropertyListing } from '../../redux/slices/propertySlice';
import { useToast } from '../../hooks/useToast';

export default function ListPropertyModal({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      city: 'Kolkata',
      locality: 'Salt Lake',
      address: '',
      propertyType: 'PG',
      genderPreference: 'Unisex',
      furnishing: 'Furnished',
      monthlyRent: 8500,
      securityDeposit: 8500,
      foodIncluded: true,
      description: '',
    },
  });

  const onSubmit = (data) => {
    const cityObj = citiesData.find((c) => c.name === data.city) || citiesData[0];
    const newId = `prop-custom-${Date.now()}`;
    const rent = Number(data.monthlyRent) || 8000;
    const deposit = Number(data.securityDeposit) || rent;

    const newProperty = {
      id: newId,
      name: data.name.trim(),
      description:
        data.description.trim() ||
        `Newly listed ${data.propertyType} in ${data.locality}, ${data.city} with comfortable monthly plans and essential amenities.`,
      city: data.city,
      locality: data.locality.trim(),
      address: data.address.trim() || `${data.locality}, ${data.city}`,
      latitude: cityObj.lat + (Math.random() - 0.5) * 0.03,
      longitude: cityObj.lng + (Math.random() - 0.5) * 0.03,
      monthlyRent: rent,
      securityDeposit: deposit,
      maintenanceCharges: 500,
      oneTimeCharges: 500,
      propertyType: data.propertyType,
      genderPreference: data.genderPreference,
      furnishing: data.furnishing,
      rating: 4.5,
      reviewCount: 1,
      popularityScore: 80,
      featured: false,
      recommended: true,
      verified: true,
      foodIncluded: data.foodIncluded,
      foodDetails: data.foodIncluded ? 'Daily home-style meals included' : 'Self-cooking access',
      availableRoomsCount: 4,
      availabilityStatus: 'Available',
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      ],
      amenities: [
        'wifi',
        ...(data.foodIncluded ? ['food'] : []),
        'ac',
        'attached_bathroom',
        'cctv',
        'power_backup',
        'drinking_water',
      ],
      roomTypes: [
        {
          id: `${newId}-single`,
          type: 'Single Sharing',
          price: Math.round(rent * 1.35),
          beds: 1,
          ac: true,
          attachedBathroom: true,
          availableBeds: 2,
          images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80',
          ],
        },
        {
          id: `${newId}-double`,
          type: 'Double Sharing',
          price: rent,
          beds: 2,
          ac: true,
          attachedBathroom: true,
          availableBeds: 2,
          images: [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80',
          ],
        },
      ],
      nearbyLandmarks: {
        railway: [`${data.city} Central Station (4.5 km)`],
        metro: [`${data.locality} Metro Stop (0.8 km)`],
        bus: [`${data.locality} Main Crossing (0.3 km)`],
        collegesAndOffices: [`${data.locality} Tech & Commercial Hub (1.1 km)`],
      },
      rules: ['Valid government ID mandatory', '1-month notice period'],
    };

    dispatch(addPropertyListing(newProperty));
    showToast('Property published to RentNest catalog (simulated)!', 'success');
    reset();
    onClose();
    navigate(`/property/${newId}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>List Your Property on RentNest</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            Frontend simulation: Your listing is saved locally in browser state so you can preview
            and book it immediately.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Property name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Property Name"
                    placeholder="e.g., GreenPark Residency PG"
                    fullWidth
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="City" fullWidth>
                    {citiesData.map((c) => (
                      <MenuItem key={c.id} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="locality"
                control={control}
                rules={{ required: 'Locality is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Locality"
                    fullWidth
                    error={Boolean(errors.locality)}
                    helperText={errors.locality?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Address"
                    placeholder="Street, Landmark, PIN Code"
                    fullWidth
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Property Type" fullWidth>
                    {['PG', 'Hostel', 'Private Room', 'Shared Room', '1 BHK', '2 BHK'].map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="genderPreference"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Preference" fullWidth>
                    {['Boys', 'Girls', 'Unisex', 'Family'].map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="furnishing"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Furnishing" fullWidth>
                    {['Furnished', 'Semi-furnished', 'Unfurnished'].map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="monthlyRent"
                control={control}
                rules={{ required: true, min: 2000 }}
                render={({ field }) => (
                  <TextField {...field} type="number" label="Monthly Rent (₹)" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="securityDeposit"
                control={control}
                rules={{ required: true, min: 0 }}
                render={({ field }) => (
                  <TextField {...field} type="number" label="Security Deposit (₹)" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={2}
                    placeholder="Highlight room comfort, nearby metro, and included facilities..."
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="foodIncluded"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={field.onChange} />}
                    label={<Typography variant="body2">Food / Meals Included</Typography>}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Publish Property
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
