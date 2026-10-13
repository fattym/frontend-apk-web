import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:8000'
    : (typeof window !== 'undefined' ? window.location.origin : ''));

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = window.location.pathname.includes('/schoolsystem/') ? '/schoolsystem/login' : '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const submitForm = (form_type, data) =>
  api.post('/api/shop/form-submissions/', { form_type, data }).then((r) => r.data);

export const fetchFormSubmissions = () =>
  api.get('/api/shop/form-submissions/').then((r) => r.data);

export const fetchBuses = () =>
  api.get('/api/transport/buses/').then((r) => r.data.results || r.data);

export const fetchDrivers = () =>
  api.get('/api/auth/users/?role=DRIVER').then((r) => r.data.results || r.data);

export const fetchStudents = () =>
  api.get('/api/auth/users/?role=STUDENT').then((r) => r.data.results || r.data);

export const fetchDriverStudents = () =>
  api.get('/api/transport/driver/students/').then((r) => r.data);

export const createAssignment = (payload) =>
  api.post('/api/transport/assignments/', payload).then((r) => r.data);

export const fetchGrades = () =>
  api.get('/api/academics/grades/').then((r) => r.data.results || r.data);

export const fetchLearningAreas = () =>
  api.get('/api/academics/learning-areas/').then((r) => r.data.results || r.data);

export const fetchTerms = () =>
  api.get('/api/academics/terms/').then((r) => (Array.isArray(r.data) ? r.data : r.data.results || r.data));

export const fetchAssessmentTasks = () =>
  api.get('/api/assessment/tasks/').then((r) => (Array.isArray(r.data) ? r.data : r.data.results || r.data));

export const createAssessmentTask = (payload) =>
  api.post('/api/assessment/tasks/', payload).then((r) => r.data);

export const fetchStreams = () =>
  api.get('/api/academics/streams/').then((r) => r.data.results || r.data);

export const patchLearnerAssessment = (learnerId, payload) =>
  api.patch(`/api/gradebook/learners/${learnerId}/assessments/`, payload).then((r) => r.data);

export const formErrorMessage = (err, fallback = 'Could not submit your request. Please try again.') => {
  if (err?.response?.data?.detail) return String(err.response.data.detail);
  if (err?.response?.data) {
    const first = Object.values(err.response.data).flat().find(Boolean);
    if (first) return String(first);
  }
  if (err instanceof Error) return err.message;
  return fallback;
};
