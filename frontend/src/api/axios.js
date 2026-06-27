import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('osn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('osn_token');
      localStorage.removeItem('osn_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  cancelEvent: (id, data) => api.put(`/events/${id}/cancel`, data),
  reschedule: (id, data) => api.put(`/events/${id}/reschedule`, data),
  downloadCancellationLetter: (id) =>
    api.get(`/events/${id}/cancellation-letter`, { responseType: 'blob' }),
  downloadRescheduleLetter: (id) =>
    api.get(`/events/${id}/reschedule-letter`, { responseType: 'blob' }),
};

// Registrations API
export const registrationsApi = {
  getAll: () => api.get('/registrations'),
  getByEvent: (eventId) => api.get(`/registrations/event/${eventId}`),
  getMy: () => api.get('/registrations/my'),
  create: (formData) =>
    api.post('/registrations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verify: (id, data) => api.put(`/registrations/${id}/verify`, data),
  downloadLetter: (id) =>
    api.get(`/registrations/${id}/letter`, { responseType: 'blob' }),
};

// Documents API
export const documentsApi = {
  download: (id) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

// Notifications API
export const notificationsApi = {
  getMy: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
