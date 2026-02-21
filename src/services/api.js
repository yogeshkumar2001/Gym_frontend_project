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

// ─── CSV Import API (future backend endpoint) ─────────────────────────────────
// Usage: importMembersFromCsv({ mappedData, options })
//   POST /import/members  →  { success: number, failed: number, errors: [] }
export const importMembersFromCsv = ({ mappedData, options = {} }) =>
  api.post('/import/members', { mappedData, options });

export default api;
