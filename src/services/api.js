import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to headers if it exists
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

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const complaintService = {
  getAll: () => api.get('/complaints'),
  getMe: () => api.get('/complaints/me'),
  getById: (id) => api.get(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  create: (complaintData, file) => {
    if (file) {
      const formData = new FormData();
      formData.append('complaint', JSON.stringify(complaintData));
      formData.append('file', file);
      return api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/complaints', { complaint: JSON.stringify(complaintData) }, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, complaintData) => api.put(`/complaints/${id}`, complaintData),
  getTimeline: (id) => api.get(`/complaints/${id}/timeline`),
  assign: (id, userId) => api.post(`/complaints/${id}/assign`, { userId }),
  addComment: (id, comment, isPublic = true) => api.post(`/complaints/${id}/comment`, { comment, isPublic }),
  resolve: (id, comment) => api.post(`/complaints/${id}/resolve`, { comment }),
  close: (id, comment) => api.post(`/complaints/${id}/close`, { comment }),
  reopen: (id, reason) => api.post(`/complaints/${id}/reopen`, { reason }),
  delete: (id) => api.delete(`/complaints/${id}`),
  export: () => api.get('/complaints/export', { responseType: 'blob' }),
};

export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
};

export const userService = {
  getAll: () => api.get('/users'),
};

export const notificationService = {
  getMy: () => api.get('/notifications/me'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
};

export default api;
