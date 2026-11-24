import { createSlice } from '@reduxjs/toolkit';
import propertiesData from '../../data/properties.json';
import reviewsData from '../../data/reviews.json';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const CUSTOM_PROPERTIES_KEY = 'rentnest_custom_properties';
const CUSTOM_REVIEWS_KEY = 'rentnest_custom_reviews';

const savedProperties = loadFromStorage(CUSTOM_PROPERTIES_KEY, []);
const savedReviews = loadFromStorage(CUSTOM_REVIEWS_KEY, []);

const propertySlice = createSlice({
  name: 'properties',
  initialState: {
    items: [...savedProperties, ...propertiesData],
    reviews: [...savedReviews, ...reviewsData],
  },
  reducers: {
    addPropertyListing: (state, action) => {
      const newProperty = action.payload;
      state.items.unshift(newProperty);
      const customOnly = state.items.filter(
        (p) => !propertiesData.some((base) => base.id === p.id)
      );
      saveToStorage(CUSTOM_PROPERTIES_KEY, customOnly);
    },
    addPropertyReview: (state, action) => {
      const review = action.payload;
      state.reviews.unshift(review);
      const customReviews = state.reviews.filter(
        (r) => !reviewsData.some((base) => base.id === r.id)
      );
      saveToStorage(CUSTOM_REVIEWS_KEY, customReviews);

      const prop = state.items.find((p) => p.id === review.propertyId);
      if (prop) {
        const totalRating = prop.rating * prop.reviewCount + review.rating;
        prop.reviewCount += 1;
        prop.rating = Number((totalRating / prop.reviewCount).toFixed(1));
      }
    },
  },
});

export const { addPropertyListing, addPropertyReview } = propertySlice.actions;

export const selectAllProperties = (state) => state.properties.items;
export const selectPropertyById = (propertyId) => (state) =>
  state.properties.items.find((p) => p.id === propertyId);
export const selectReviewsByPropertyId = (propertyId) => (state) =>
  state.properties.reviews.filter((r) => r.propertyId === propertyId);

export default propertySlice.reducer;
