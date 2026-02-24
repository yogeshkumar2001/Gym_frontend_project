import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
// Converts filterSlice shape → query string params for list endpoints.
export const buildQueryParams = (filters = {}) => {
  const params = {};
  if (filters.startDate)                params.startDate = filters.startDate;
  if (filters.endDate)                  params.endDate   = filters.endDate;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.plan   && filters.plan   !== 'all') params.planId = filters.plan;
  if (filters.search?.trim())           params.search    = filters.search.trim();
  return params;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
// POST /auth/login    → { success, data: { token, user } }
// POST /auth/register → { success, data: { token, user } }
// GET  /auth/me       → { success, data: user }
export const login    = (credentials) => api.post('/auth/login', credentials);
export const register = (data)        => api.post('/auth/register', data);
export const getMe    = ()            => api.get('/auth/me');

// ─── Members ──────────────────────────────────────────────────────────────────
// GET    /members              → { success, rows, count, page, limit }
// GET    /members/:id          → { success, data } — includes plan + assignments
// POST   /members              → { success, data }
// PUT    /members/:id          → { success, data }
// DELETE /members/:id          → { success, message }
export const fetchMembers    = (filters = {}) => api.get('/members', { params: buildQueryParams(filters) });
export const fetchMemberById = (id)           => api.get(`/members/${id}`);
export const createMember    = (data)         => api.post('/members', data);
export const updateMember    = (id, data)     => api.put(`/members/${id}`, data);
export const deleteMember    = (id)           => api.delete(`/members/${id}`);

// ─── Plans ────────────────────────────────────────────────────────────────────
// GET    /plans        → { success, rows, count, page, limit }
// GET    /plans/:id    → { success, data }
// POST   /plans        → { success, data }
// PUT    /plans/:id    → { success, data }
// DELETE /plans/:id    → { success, message }  (409 if members are on this plan)
export const fetchPlans    = (params = {}) => api.get('/plans', { params });
export const fetchPlanById = (id)          => api.get(`/plans/${id}`);
export const createPlan    = (data)        => api.post('/plans', data);
export const patchPlan     = (id, data)    => api.put(`/plans/${id}`, data);
export const removePlan    = (id)          => api.delete(`/plans/${id}`);

// ─── Payments ─────────────────────────────────────────────────────────────────
// GET    /payments        → { success, rows, count, page, limit } — includes member + plan
// GET    /payments/:id    → { success, data } — includes member + plan
// POST   /payments        → { success, data } — invoiceNumber auto-generated
// PUT    /payments/:id    → { success, data }
// DELETE /payments/:id    → { success, message }
export const fetchPayments    = (filters = {}) => api.get('/payments', { params: buildQueryParams(filters) });
export const fetchPaymentById = (id)           => api.get(`/payments/${id}`);
export const createPayment    = (data)         => api.post('/payments', data);
export const updatePayment    = (id, data)     => api.put(`/payments/${id}`, data);
export const deletePayment    = (id)           => api.delete(`/payments/${id}`);

// ─── Workouts ─────────────────────────────────────────────────────────────────
// GET    /workouts        → { success, rows, count, page, limit }
// GET    /workouts/:id    → { success, data }
// POST   /workouts        → { success, data }  — createdBy set from JWT
// PUT    /workouts/:id    → { success, data }
// DELETE /workouts/:id    → { success, message }
export const fetchWorkoutTemplates    = (params = {}) => api.get('/workouts', { params });
export const fetchWorkoutTemplateById = (id)          => api.get(`/workouts/${id}`);
export const createWorkoutTemplate    = (data)        => api.post('/workouts', data);
export const updateWorkoutTemplate    = (id, data)    => api.put(`/workouts/${id}`, data);
export const removeWorkoutTemplate    = (id)          => api.delete(`/workouts/${id}`);

// ─── Diets ────────────────────────────────────────────────────────────────────
// GET    /diets        → { success, rows, count, page, limit }
// GET    /diets/:id    → { success, data }
// POST   /diets        → { success, data }  — createdBy set from JWT
// PUT    /diets/:id    → { success, data }
// DELETE /diets/:id    → { success, message }
export const fetchDietTemplates    = (params = {}) => api.get('/diets', { params });
export const fetchDietTemplateById = (id)          => api.get(`/diets/${id}`);
export const createDietTemplate    = (data)        => api.post('/diets', data);
export const updateDietTemplate    = (id, data)    => api.put(`/diets/${id}`, data);
export const removeDietTemplate    = (id)          => api.delete(`/diets/${id}`);

// ─── Assignments ──────────────────────────────────────────────────────────────
// Assignments are embedded in GET /members/:id — fetchMemberById is the primary way
// to load a member profile with full workout + diet history.
//
// POST /assignments/workout              → { success, data } — active→completed + new active
// POST /assignments/diet                 → { success, data }
// PUT  /assignments/workout/:id/complete → { success, message }
// PUT  /assignments/diet/:id/complete    → { success, message }
export const fetchMemberAssignments = (memberId)        => api.get(`/members/${memberId}`);
export const assignMemberWorkout    = (memberId, data)  => api.post('/assignments/workout', { memberId, ...data });
export const assignMemberDiet       = (memberId, data)  => api.post('/assignments/diet',    { memberId, ...data });
export const completeWorkoutAssignment = (assignmentId) => api.put(`/assignments/workout/${assignmentId}/complete`);
export const completeDietAssignment    = (assignmentId) => api.put(`/assignments/diet/${assignmentId}/complete`);

// ─── Notifications ────────────────────────────────────────────────────────────
// GET  /notifications/expiry-reminders?days=N   → { success, data: [...members with daysRemaining] }
// GET  /notifications/payment-reminders?days=N  → { success, data: [...payments with daysOverdue] }
// POST /notifications/send                       → { success, result: { sent, memberId, type, channel } }
export const fetchExpiryReminders  = (days = 7) => api.get('/notifications/expiry-reminders',  { params: { days } });
export const fetchPaymentReminders = (days = 7) => api.get('/notifications/payment-reminders', { params: { days } });
export const sendNotification = ({ memberId, type, channel = 'email' }) =>
  api.post('/notifications/send', { memberId, type, channel });

// ─── Analytics ────────────────────────────────────────────────────────────────
// GET /analytics?metric=revenue&dimension=month&startDate=...&endDate=...
// → { success, data, total, dataPoints, max, isCurrency, isAttendanceStub }
export const fetchAnalyticsData = (params) => api.get('/analytics', { params });

// ─── CSV Import (frontend-only — no backend endpoint yet) ────────────────────
export const importMembersFromCsv = ({ mappedData, options = {} }) =>
  api.post('/import/members', { mappedData, options });

export default api;
