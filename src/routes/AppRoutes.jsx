import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import SearchResultsPage from '../pages/SearchResults/SearchResultsPage';
import PropertyDetailsPage from '../pages/PropertyDetails/PropertyDetailsPage';
import BookingPage from '../pages/Booking/BookingPage';
import WishlistPage from '../pages/Wishlist/WishlistPage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import MyBookingsPage from '../pages/MyBookings/MyBookingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
      <Route path="/booking/:id" element={<BookingPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
