import axios from 'axios';

/**
 * Placeholder Axios instance configured for future backend API integration.
 * In the current frontend-only version, no live HTTP requests are dispatched.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
