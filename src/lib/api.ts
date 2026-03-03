import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants'
import { useAuthStore } from '@/store/authStore'

/**
 * Axios instance for API requests.
 * - Base URL from env (VITE_API_BASE_URL)
 * - Request interceptor: adds Authorization + X-Workspace-ID from auth store
 * - Response interceptor: placeholder for 401 token refresh
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const { accessToken, workspaceId } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (workspaceId) {
    config.headers['X-Workspace-ID'] = workspaceId
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: implement 401 handling + token refresh via POST /api/auth/token/refresh/
    return Promise.reject(error)
  }
)
