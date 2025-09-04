// lib/apiService.js
import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kuki-yugs.onrender.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage key for user data
const USER_DATA_KEY = 'userData';

// Get headers with authentication token
export async function getHeaders() {
  try {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('Using token for request:', parsedData.token ? 'Token found' : 'No token');
        return {
          authorization: `Bearer ${parsedData.token}`,
        };
      }
    }
    return {};
  } catch (error) {
    console.error('Error getting headers:', error);
    return {};
  }
}

// Store user data in localStorage
export function storeUserData(userData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
}

// Get user data from localStorage
export function getUserData() {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}

// Clear user data (logout)
export function clearUserData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_DATA_KEY);
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const userData = getUserData();
  return userData && userData.token;
}

// Main API request function
export async function apiReq(
  endPoint,
  data = {},
  method = 'get',
  headers = {},
  requestOptions = {}
) {
  return new Promise(async (resolve, reject) => {
    try {
      const tokenHeaders = await getHeaders();
      const finalHeaders = {
        ...tokenHeaders,
        ...headers
      };

      let config = {
        ...requestOptions,
        headers: finalHeaders,
        method: method.toLowerCase(),
        url: endPoint
      };

      // For GET and DELETE requests, send data as params
      if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
        config.params = data;
      } else {
        // For POST, PUT, PATCH requests, send data in body
        config.data = data;
      }

      console.log('API Request:', {
        endpoint: endPoint,
        method: method.toUpperCase(),
        hasToken: !!tokenHeaders.authorization
      });

      const result = await apiClient(config);
      const responseData = result.data;

      // Check for API-specific error status
      if (responseData.success === false) {
        return reject(responseData);
      }

      console.log('API Success:', endPoint);
      return resolve(responseData);

    } catch (error) {
      console.error('API Error:', error);

      // Handle network errors
      if (!error.response) {
        return reject({
          success: false,
          message: 'Network Error - Please check your connection',
          error: 'NETWORK_ERROR'
        });
      }

      // Handle 401 Unauthorized - User session expired
      if (error.response.status === 401) {
        console.log('Unauthorized access - clearing user data');
        clearUserData();
        
        // Redirect to login page in browser
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/auth/login';
        // }
        
        return reject({
          success: false,
          message: 'Your session has expired. Please login again.',
          error: 'UNAUTHORIZED'
        });
      }

      // Handle other HTTP errors
      if (error.response && error.response.data) {
        return reject({
          success: false,
          ...error.response.data,
          message: error.response.data.message || 'An error occurred'
        });
      }

      // Generic error
      return reject({
        success: false,
        message: 'Something went wrong. Please try again.',
        error: 'UNKNOWN_ERROR'
      });
    }
  });
}

// Convenient methods for different HTTP verbs
export function apiPost(endPoint, data = {}, headers = {}) {
  return apiReq(endPoint, data, 'post', headers);
}

export function apiGet(endPoint, data = {}, headers = {}, requestOptions = {}) {
  return apiReq(endPoint, data, 'get', headers, requestOptions);
}

export function apiPut(endPoint, data = {}, headers = {}) {
  return apiReq(endPoint, data, 'put', headers);
}

export function apiDelete(endPoint, data = {}, headers = {}) {
  return apiReq(endPoint, data, 'delete', headers);
}

export function apiPatch(endPoint, data = {}, headers = {}) {
  return apiReq(endPoint, data, 'patch', headers);
}

// Authentication specific API calls
export const authAPI = {
  // User registration
  register: (userData) => apiPost('/user/register', userData),
  
  // User login
  login: (credentials) => apiPost('/user/login', credentials),
  
  // Get user profile
  getProfile: () => apiGet('/user/profile'),
  
  // Update user profile
  updateProfile: (userData) => apiPut('/user/profile', userData),
  
  // Change password
  changePassword: (passwordData) => apiPut('/user/change-password', passwordData),
  
  // Refresh token
  refreshToken: (refreshToken) => apiPost('/user/refresh-token', { refreshToken }),
  
  // Logout
  logout: () => apiPost('/user/logout'),
};

// OpenGDS specific API calls
export const openGDSAPI = {
  // Get all records
  getRecords: (params = {}) => apiGet('/opengds', params),
  
  // Get single record
  getRecord: (id) => apiGet(`/opengds/${id}`),
  
  // Create new record
  createRecord: (recordData) => apiPost('/opengds', recordData),
  
  // Update record
  updateRecord: (id, recordData) => apiPut(`/opengds/${id}`, recordData),
  
  // Delete record
  deleteRecord: (id) => apiDelete(`/opengds/${id}`),
  
  // Bulk create records
  bulkCreateRecords: (records) => apiPost('/opengds/bulk', { records }),
  
  // Bulk delete records
  bulkDeleteRecords: (ids) => apiDelete('/opengds/bulk', { ids }),
  
  // Get statistics
  getStatistics: () => apiGet('/opengds/stats'),
};

// Request interceptor to add auth header automatically
apiClient.interceptors.request.use(
  async (config) => {
    const headers = await getHeaders();
    config.headers = { ...config.headers, ...headers };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling can be added here
    if (error.response?.status === 401) {
      // Clear user data on 401
      clearUserData();
    }
    return Promise.reject(error);
  }
);

