import { createSlice } from '@reduxjs/toolkit';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const WISHLIST_KEY = 'rentnest_wishlist';
const savedWishlist = loadFromStorage(WISHLIST_KEY, ['prop-kol-01', 'prop-kol-07']);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    ids: savedWishlist,
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((item) => item !== id);
      } else {
        state.ids.push(id);
      }
      saveToStorage(WISHLIST_KEY, state.ids);
    },
    removeFromWishlist: (state, action) => {
      state.ids = state.ids.filter((item) => item !== action.payload);
      saveToStorage(WISHLIST_KEY, state.ids);
    },
    clearWishlist: (state) => {
      state.ids = [];
      saveToStorage(WISHLIST_KEY, []);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export const selectWishlistIds = (state) => state.wishlist.ids;

export default wishlistSlice.reducer;
