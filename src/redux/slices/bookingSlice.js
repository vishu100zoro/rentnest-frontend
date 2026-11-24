import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const BOOKINGS_KEY = 'rentnest_bookings';

const defaultBookings = [
  {
    id: 'RN-2026-8412',
    propertyId: 'prop-kol-01',
    propertyName: 'TechnoStay Sector V Residences',
    propertyImage:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80',
    locality: 'Sector V',
    city: 'Kolkata',
    roomType: 'Double Sharing',
    moveInDate: dayjs().add(12, 'day').format('YYYY-MM-DD'),
    durationMonths: 6,
    occupants: 1,
    monthlyRent: 8900,
    securityDeposit: 7800,
    maintenanceCharges: 500,
    oneTimeCharges: 1000,
    totalInitialPayment: 18200,
    status: 'Upcoming',
    occupantName: 'Aarav Chatterjee',
    occupantEmail: 'aarav@rentnest.demo',
    occupantPhone: '+91 98301 44210',
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
  },
  {
    id: 'RN-2025-3910',
    propertyId: 'prop-kol-10',
    propertyName: 'Jadavpur Academic Residence',
    propertyImage:
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=700&q=80',
    locality: 'Jadavpur',
    city: 'Kolkata',
    roomType: 'Single Sharing',
    moveInDate: '2025-11-01',
    durationMonths: 6,
    occupants: 1,
    monthlyRent: 11200,
    securityDeposit: 7200,
    maintenanceCharges: 400,
    oneTimeCharges: 600,
    totalInitialPayment: 19400,
    status: 'Completed',
    occupantName: 'Aarav Chatterjee',
    occupantEmail: 'aarav@rentnest.demo',
    occupantPhone: '+91 98301 44210',
    createdAt: '2025-10-20',
  },
];

const savedBookings = loadFromStorage(BOOKINGS_KEY, defaultBookings);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: savedBookings,
    draft: null,
  },
  reducers: {
    setBookingDraft: (state, action) => {
      state.draft = action.payload;
    },
    clearBookingDraft: (state) => {
      state.draft = null;
    },
    createBooking: (state, action) => {
      const booking = {
        ...action.payload,
        id: `RN-${dayjs().year()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Upcoming',
        createdAt: dayjs().format('YYYY-MM-DD'),
      };
      state.items.unshift(booking);
      state.draft = null;
      saveToStorage(BOOKINGS_KEY, state.items);
    },
    cancelBooking: (state, action) => {
      const booking = state.items.find((b) => b.id === action.payload);
      if (booking && booking.status === 'Upcoming') {
        booking.status = 'Cancelled';
        saveToStorage(BOOKINGS_KEY, state.items);
      }
    },
  },
});

export const { setBookingDraft, clearBookingDraft, createBooking, cancelBooking } =
  bookingSlice.actions;

export const selectAllBookings = (state) => state.bookings.items;
export const selectBookingDraft = (state) => state.bookings.draft;

export default bookingSlice.reducer;
