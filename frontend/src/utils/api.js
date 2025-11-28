import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';
const API_BASE_URL = `${API_URL}${API_BASE_PATH}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      error.message = 'Session expired. Please login again.';
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      error.message = error.response.data?.message || 'Access denied. You do not have permission to perform this action.';
    }

    // Handle 404 Not Found
    if (error.response.status === 404) {
      error.message = error.response.data?.message || 'Resource not found.';
    }

    // Handle 409 Conflict
    if (error.response.status === 409) {
      error.message = error.response.data?.message || 'Conflict detected. Please try again.';
    }

    // Handle 500 Server Error
    if (error.response.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }

    // Use error message from response if available
    if (error.response.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

// Add upload method for file uploads
api.upload = async (url, formData, onUploadProgress) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_BASE_URL}${url}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    onUploadProgress,
  });
};

export default api;
export { API_URL, API_BASE_URL };
