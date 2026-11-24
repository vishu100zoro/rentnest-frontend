import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import searchReducer from './slices/searchSlice';
import wishlistReducer from './slices/wishlistSlice';
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    search: searchReducer,
    wishlist: wishlistReducer,
    bookings: bookingReducer,
  },
});

export default store;
