import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Request interceptor — attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ecotrack_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecotrack_token')
      localStorage.removeItem('ecotrack_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
}

// ─── Users ─────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: d => api.put('/users/me', d),
  getStats: () => api.get('/users/stats'),
}

// ─── Carbon ─────────────────────────────────────────────
export const carbonAPI = {
  calculate: d => api.post('/carbon/calculate', d),
  logActivity: d => api.post('/carbon/activity', d),
  getActivities: (limit = 20) => api.get(`/carbon/activities?limit=${limit}`),
  getAnalytics: () => api.get('/carbon/analytics'),
}

// ─── AI Coach ──────────────────────────────────────────
export const aiAPI = {
  chat: msg => api.post('/ai/chat', { message: msg }),
  getTips: (count = 3) => api.get(`/ai/tips?count=${count}`),
  getInsight: () => api.get('/ai/insight'),
  getPredictions: (months = 12) => api.get(`/ai/predictions?months=${months}`),
  getForecast: () => api.get('/ai/forecast'),
}

// ─── Challenges ─────────────────────────────────────────
export const challengeAPI = {
  getAll: () => api.get('/challenges/'),
  join: id => api.post('/challenges/join', { challenge_id: id }),
  complete: id => api.post('/challenges/complete', { user_challenge_id: id }),
  getMyChallenges: () => api.get('/challenges/my'),
}

// ─── Leaderboard ────────────────────────────────────────
export const leaderboardAPI = {
  get: (sortBy = 'xp', limit = 20) =>
    api.get(`/leaderboard/?sort_by=${sortBy}&limit=${limit}`),
}

// ─── Keep Alive (Render free tier) ───────────────────────
const BACKEND_BASE = API_BASE.replace('/api/v1', '')
export const startKeepAlive = () => {
  const ping = () => axios.get(`${BACKEND_BASE}/health`).catch(() => {})
  ping() // immediate on load
  setInterval(ping, 14 * 60 * 1000) // every 14 min
}

export default api
