import { createSlice } from '@reduxjs/toolkit';
import initialUsers from '../../data/users.json';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../../utils/storage';

const AUTH_USER_KEY = 'rentnest_auth_user';
const REGISTERED_USERS_KEY = 'rentnest_registered_users';

const savedUser = loadFromStorage(AUTH_USER_KEY, null);
const savedRegistered = loadFromStorage(REGISTERED_USERS_KEY, []);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    isAuthenticated: Boolean(savedUser),
    registeredUsers: savedRegistered,
    error: null,
  },
  reducers: {
    loginUser: (state, action) => {
      const { email, password } = action.payload;
      const allUsers = [...initialUsers, ...state.registeredUsers];
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!found) {
        state.error = 'Invalid email or password. Try aarav@rentnest.demo / Password@123';
        return;
      }

      const { password: _pwd, ...safeUser } = found;
      state.user = safeUser;
      state.isAuthenticated = true;
      state.error = null;
      saveToStorage(AUTH_USER_KEY, safeUser);
    },
    loginDemoUser: (state) => {
      const demo = initialUsers[0];
      const { password: _pwd, ...safeUser } = demo;
      state.user = safeUser;
      state.isAuthenticated = true;
      state.error = null;
      saveToStorage(AUTH_USER_KEY, safeUser);
    },
    registerUser: (state, action) => {
      const { name, email, password, phone, city, occupation, gender } = action.payload;
      const allUsers = [...initialUsers, ...state.registeredUsers];
      const exists = allUsers.some(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (exists) {
        state.error = 'An account with this email already exists.';
        return;
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone || '+91 90000 00000',
        city: city || 'Kolkata',
        occupation: occupation || 'Working Professional',
        gender: gender || 'Prefer not to say',
        emergencyContact: '',
        avatar: '',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      state.registeredUsers.push(newUser);
      saveToStorage(REGISTERED_USERS_KEY, state.registeredUsers);

      const { password: _pwd, ...safeUser } = newUser;
      state.user = safeUser;
      state.isAuthenticated = true;
      state.error = null;
      saveToStorage(AUTH_USER_KEY, safeUser);
    },
    updateProfile: (state, action) => {
      if (!state.user) return;
      const updated = { ...state.user, ...action.payload };
      state.user = updated;
      saveToStorage(AUTH_USER_KEY, updated);

      const idx = state.registeredUsers.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        state.registeredUsers[idx] = { ...state.registeredUsers[idx], ...action.payload };
        saveToStorage(REGISTERED_USERS_KEY, state.registeredUsers);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      removeFromStorage(AUTH_USER_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginUser,
  loginDemoUser,
  registerUser,
  updateProfile,
  logoutUser,
  clearAuthError,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
