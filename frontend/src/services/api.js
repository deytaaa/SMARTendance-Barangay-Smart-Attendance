import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Attendance API
export const attendanceAPI = {
  checkIn: (userId) => api.post('/attendance/check-in', { userId }),
  checkOut: (attendanceId) => api.post('/attendance/check-out', { attendanceId }),
  getAll: (query) => api.get('/attendance', { params: query }),
  getToday: () => api.get('/attendance/today'),
  getUserAttendance: (userId, query) => 
    api.get(`/attendance/user/${userId}`, { params: query }),
  getReport: (query) => api.get('/attendance/report', { params: query }),
};

// Barangay API
export const barangayAPI = {
  getAll: () => api.get('/barangays'),
  getById: (id) => api.get(`/barangays/${id}`),
  create: (data) => api.post('/barangays', data),
  update: (id, data) => api.put(`/barangays/${id}`, data),
  delete: (id) => api.delete(`/barangays/${id}`),
  getSettings: () => api.get('/barangays/settings'),
  updateSettings: (data) => api.put('/barangays/settings', data),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const systemAPI = {
  getSettings: () => api.get('/system-settings'),
  updateSettings: (data) => api.put('/system-settings', data),
};

// QR Card API
export const qrAPI = {
  getAll: () => api.get('/qr'),
  getById: (userId) => api.get(`/qr/${userId}`),
  generate: () => api.post('/qr/generate'),
  generateOne: (userId) => api.post(`/qr/generate/${userId}`),
  download: (userId) => {
    return api.get(`/qr/download/${userId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'image/png',
      }
    });
  },
};

export default api;
