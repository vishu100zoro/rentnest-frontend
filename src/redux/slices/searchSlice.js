import { createSlice, createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { filterAndSortProperties } from '../../utils/filterProperties';
import { getBudgetRangeFromPreset } from '../../utils/formatters';

const initialState = {
  query: {
    location: '',
    propertyType: 'All',
    budgetPreset: 'any',
    moveInDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
  },
  filters: {
    minRent: 0,
    maxRent: 30000,
    propertyTypes: [],
    genderPreference: 'All',
    roomSharing: [],
    furnishing: 'All',
    acPreference: 'All',
    attachedBathroom: false,
    foodIncluded: false,
    amenities: [],
    maxDistanceKm: 50,
    minRating: 0,
    availableOnly: false,
  },
  sortBy: 'recommended',
  userLocation: null, // { lat, lng, label, isFallback }
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = { ...state.query, ...action.payload };
      if (action.payload.budgetPreset !== undefined) {
        const range = getBudgetRangeFromPreset(action.payload.budgetPreset);
        state.filters.minRent = range.minRent;
        state.filters.maxRent = range.maxRent;
      }
      if (action.payload.propertyType !== undefined) {
        if (action.payload.propertyType === 'All') {
          state.filters.propertyTypes = [];
        } else if (action.payload.propertyType === '1 BHK / 2 BHK Flats') {
          state.filters.propertyTypes = ['1 BHK', '2 BHK'];
        } else {
          state.filters.propertyTypes = [action.payload.propertyType];
        }
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleArrayFilter: (state, action) => {
      const { key, value } = action.payload;
      const arr = state.filters[key] || [];
      if (arr.includes(value)) {
        state.filters[key] = arr.filter((item) => item !== value);
      } else {
        state.filters[key] = [...arr, value];
      }

      if (key === 'propertyTypes') {
        const next = state.filters.propertyTypes;
        if (next.length === 0) {
          state.query.propertyType = 'All';
        } else if (
          next.length === 2 &&
          next.includes('1 BHK') &&
          next.includes('2 BHK')
        ) {
          state.query.propertyType = '1 BHK / 2 BHK Flats';
        } else if (next.length === 1) {
          state.query.propertyType = next[0];
        } else {
          state.query.propertyType = 'All';
        }
      }
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      if (action.payload) {
        state.sortBy = 'nearest';
      }
    },
    clearUserLocation: (state) => {
      state.userLocation = null;
      if (state.sortBy === 'nearest') {
        state.sortBy = 'recommended';
      }
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
      state.query.propertyType = 'All';
      state.query.budgetPreset = 'any';
    },
    resetAllSearch: () => initialState,
  },
});

export const {
  setSearchQuery,
  setFilters,
  toggleArrayFilter,
  setSortBy,
  setUserLocation,
  clearUserLocation,
  resetFilters,
  resetAllSearch,
} = searchSlice.actions;

export const selectSearchState = (state) => state.search;

export const selectFilteredProperties = createSelector(
  [(state) => state.properties.items, (state) => state.search],
  (properties, searchState) => filterAndSortProperties(properties, searchState)
);

export default searchSlice.reducer;
