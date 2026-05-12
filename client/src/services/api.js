import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: (id) => api.get(`/auth/profile/${id}`)
};

// Emergency APIs
export const emergencyAPI = {
  create: (data) => api.post('/emergency/create', data),
  getAll: (status) => api.get('/emergency/all', { params: { status } }),
  getById: (id) => api.get(`/emergency/${id}`),
  updateStatus: (id, data) => api.put(`/emergency/${id}/status`, data),
  updateLocation: (id, data) => api.post(`/emergency/${id}/location`, data),
  getUserEmergencies: (userId) => api.get(`/emergency/user/${userId}`)
};

// Agency APIs
export const agencyAPI = {
  getAll: () => api.get('/agency/all'),
  getByType: (type) => api.get(`/agency/type/${type}`),
  acceptEmergency: (emergencyId, data) => api.post(`/agency/accept/${emergencyId}`, data),
  updateStatus: (emergencyId, data) => api.put(`/agency/status/${emergencyId}`, data),
  getStats: (agencyId) => api.get(`/agency/stats/${agencyId}`),
  // Admin CRUD
  create: (data) => api.post('/agency/create', data),
  update: (id, data) => api.put(`/agency/update/${id}`, data),
  toggleStatus: (id) => api.patch(`/agency/toggle/${id}`),
  delete: (id) => api.delete(`/agency/delete/${id}`)
};

// Analytics / Admin APIs
export const analyticsAPI = {
  getStatistics: () => api.get('/analytics/statistics'),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getResponseTime: (agencyId) => api.get(`/analytics/response-time/${agencyId}`),
  generateReport: (data) => api.post('/analytics/report', data, { responseType: 'blob' })
};

// Admin APIs (user management via auth routes)
export const adminAPI = {
  getAllUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  getAllAgencies: () => api.get('/agency/all')
};

// Wildlife APIs
export const wildlifeAPI = {
  createReport: (formData) => api.post('/wildlife/report', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAllReports: () => api.get('/wildlife/reports'),
  getMyReports: (userId) => api.get(`/wildlife/my-reports?userId=${userId}`),
  updateStatus: (id, status) => api.put(`/wildlife/update-status/${id}`, { status })
};

export default api;
