/**
 * Axios API client — centralized HTTP layer for EcoTrack AI backend.
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecotrack_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecotrack_token')
      localStorage.removeItem('ecotrack_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getStats: () => api.get('/users/stats'),
}

// ─── Carbon Calculator ───────────────────────────────────────────────────────
export const carbonAPI = {
  calculate: (data) => api.post('/carbon/calculate', data),
  logActivity: (data) => api.post('/carbon/activity', data),
  getActivities: (limit = 20) => api.get(`/carbon/activities?limit=${limit}`),
  getAnalytics: () => api.get('/carbon/analytics'),
}

// ─── AI Coach ────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  getTips: (count = 3) => api.get(`/ai/tips?count=${count}`),
  getInsight: () => api.get('/ai/insight'),
  getPredictions: (months = 12) => api.get(`/ai/predictions?months=${months}`),
  getForecast: () => api.get('/ai/forecast'),
}

// ─── Challenges ──────────────────────────────────────────────────────────────
export const challengeAPI = {
  getAll: () => api.get('/challenges/'),
  join: (challenge_id) => api.post('/challenges/join', { challenge_id }),
  complete: (user_challenge_id) => api.post('/challenges/complete', { user_challenge_id }),
  getMyChallenges: () => api.get('/challenges/my'),
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardAPI = {
  get: (sortBy = 'xp', limit = 20) =>
    api.get(`/leaderboard/?sort_by=${sortBy}&limit=${limit}`),
}

export default api
