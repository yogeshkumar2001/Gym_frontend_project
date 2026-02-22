import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Filter → Query Params Builder ───────────────────────────────────────────
// Usage: api.get('/members', { params: buildQueryParams(filters) })
export const buildQueryParams = (filters = {}) => {
  const params = {};

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.plan && filters.plan !== 'all') params.planId = filters.plan;
  if (filters.search?.trim()) params.search = filters.search.trim();

  return params;
};

// ─── Notifications API (future backend endpoints) ─────────────────────────────
// POST /notifications/send  →  { success: true, channel, memberId }
export const sendNotification = ({ memberId, type, channel = 'sms' }) =>
  api.post('/notifications/send', { memberId, type, channel });

// GET /notifications/candidates?startDate=...&endDate=...&reminderDays=...
export const fetchNotificationCandidates = (params) =>
  api.get('/notifications/candidates', { params: buildQueryParams(params) });

// ─── Analytics API (future backend endpoint) ──────────────────────────────────
// Usage: fetchAnalyticsData({ metric, dimension, startDate, endDate, plan, status })
//   GET /analytics/data?metric=revenue&dimension=month&...
//   → { data: [{ name, value }, ...], total, dataPoints, max }
export const fetchAnalyticsData = (params) =>
  api.get('/analytics/data', { params: buildQueryParams(params) });

// ─── Assignment API (future backend endpoints) ────────────────────────────────
// POST /members/:id/workout-assignment  →  { assignment }
// POST /members/:id/diet-assignment     →  { assignment }
// GET  /members/:id/assignments         →  { workoutAssignments, dietAssignments }
export const fetchMemberAssignments   = (memberId)       => api.get(`/members/${memberId}/assignments`);
export const assignMemberWorkout      = (memberId, data) => api.post(`/members/${memberId}/workout-assignment`, data);
export const assignMemberDiet         = (memberId, data) => api.post(`/members/${memberId}/diet-assignment`, data);

// ─── Diets API (future backend endpoints) ────────────────────────────────────
// GET /diets/templates          → [DietTemplate]
// GET /diets/templates/:id      → DietTemplate
// POST /diets/templates         → created template
// PUT /diets/templates/:id      → updated template
// DELETE /diets/templates/:id   → { success: true }
export const fetchDietTemplates    = ()           => api.get('/diets/templates');
export const fetchDietTemplateById = (id)         => api.get(`/diets/templates/${id}`);
export const createDietTemplate    = (data)       => api.post('/diets/templates', data);
export const updateDietTemplate    = (id, data)   => api.put(`/diets/templates/${id}`, data);
export const removeDietTemplate    = (id)         => api.delete(`/diets/templates/${id}`);

// ─── Workouts API (future backend endpoints) ─────────────────────────────────
// GET /workouts/templates          → [WorkoutTemplate]
// GET /workouts/templates/:id      → WorkoutTemplate
// POST /workouts/templates         → created template
// PUT /workouts/templates/:id      → updated template
// DELETE /workouts/templates/:id   → { success: true }
export const fetchWorkoutTemplates    = ()           => api.get('/workouts/templates');
export const fetchWorkoutTemplateById = (id)         => api.get(`/workouts/templates/${id}`);
export const createWorkoutTemplate    = (data)       => api.post('/workouts/templates', data);
export const updateWorkoutTemplate    = (id, data)   => api.put(`/workouts/templates/${id}`, data);
export const removeWorkoutTemplate    = (id)         => api.delete(`/workouts/templates/${id}`);

// ─── Plans API (future backend endpoints) ────────────────────────────────────
// GET /plans                → [{ id, name, description, durationMonths, price, status }]
// POST /plans               → created plan
// PUT /plans/:id            → updated plan
// DELETE /plans/:id         → { success: true }
export const fetchPlans   = ()           => api.get('/plans');
export const createPlan   = (data)       => api.post('/plans', data);
export const patchPlan    = (id, data)   => api.put(`/plans/${id}`, data);
export const removePlan   = (id)         => api.delete(`/plans/${id}`);

// ─── CSV Import API (future backend endpoint) ─────────────────────────────────
// Usage: importMembersFromCsv({ mappedData, options })
//   POST /import/members  →  { success: number, failed: number, errors: [] }
export const importMembersFromCsv = ({ mappedData, options = {} }) =>
  api.post('/import/members', { mappedData, options });

export default api;
