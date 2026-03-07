import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach access token ──────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const schoolId = getSchoolId()
    if (schoolId) {
      config.headers['X-School-ID'] = schoolId
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle token refresh ────────────────────
let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = data.data

        setTokens(accessToken, newRefreshToken)
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)
        clearTokens()
        window.location.href = '/login?reason=session_expired'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ── Token helpers ─────────────────────────────────────────────────

const TOKEN_KEY = 'edu_access_token'
const REFRESH_TOKEN_KEY = 'edu_refresh_token'
const SCHOOL_ID_KEY = 'edu_school_id'

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const getSchoolId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SCHOOL_ID_KEY)
}

export const setTokens = (accessToken: string, refreshToken: string, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, accessToken)
  } else {
    sessionStorage.setItem(TOKEN_KEY, accessToken)
  }
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const setSchoolId = (schoolId: string) => {
  localStorage.setItem(SCHOOL_ID_KEY, schoolId)
}

export const clearTokens = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// ── Typed API helpers ─────────────────────────────────────────────

export const api = {
  get: <T>(url: string, params?: object) =>
    apiClient.get<{ data: T; success: boolean; message: string }>(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<{ data: T; success: boolean; message: string }>(url, data).then((r) => r.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<{ data: T; success: boolean; message: string }>(url, data).then((r) => r.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<{ data: T; success: boolean; message: string }>(url, data).then((r) => r.data),

  delete: <T>(url: string) =>
    apiClient.delete<{ data: T; success: boolean; message: string }>(url).then((r) => r.data),

  upload: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void) =>
    apiClient
      .post<{ data: T; success: boolean; message: string }>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          }
        },
      })
      .then((r) => r.data),
}
