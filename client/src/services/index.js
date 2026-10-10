import api from './api';

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Services
export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Providers
export const providerService = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  getMe: () => api.get('/providers/me'),
  create: (data) => api.post('/providers', data),
  update: (id, data) => api.put(`/providers/${id}`, data),
  delete: (id) => api.delete(`/providers/${id}`),
  updateStatus: (id, data) => api.patch(`/providers/${id}/status`, data),
  getAvailability: (providerId, date) => api.get(`/providers/${providerId}/availability`, { params: { date } }),
  getSchedule: (providerId, date) => api.get(`/providers/${providerId}/schedule`, { params: { date } }),
};

// Bookings
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
};

// Reviews
export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByProvider: (providerId, params) => api.get(`/reviews/provider/${providerId}`, { params }),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  getAll: (params) => api.get('/reviews', { params }),
};

// Users
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

// Admin
export const adminService = {
  getStats: () => api.get('/admin/stats'),
};

// Service Requests (Provider submission + Admin approval)
export const serviceRequestService = {
  create: (data) => api.post('/service-requests', data),
  getMy: () => api.get('/service-requests/my'),
  getAll: (params) => api.get('/service-requests', { params }),
  review: (id, data) => api.patch(`/service-requests/${id}/review`, data),
  resubmit: (id, data) => api.patch(`/service-requests/${id}/resubmit`, data),
};
