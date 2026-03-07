import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { MMKV } from 'react-native-mmkv'
import { UserRole, AuthTokens } from '@edusuite/shared-types'

// MMKV is much faster than AsyncStorage
const storage = new MMKV({ id: 'edusuite-auth' })

const mmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.delete(name),
}

interface AuthUser {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId: string
  branchId?: string
  profilePicture?: string
  isActive: boolean
}

interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  biometricsEnabled: boolean
  deviceToken?: string

  // Actions
  setUser: (user: AuthUser) => void
  setTokens: (tokens: AuthTokens) => void
  login: (user: AuthUser, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
  setBiometricsEnabled: (enabled: boolean) => void
  setDeviceToken: (token: string) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      biometricsEnabled: false,
      deviceToken: undefined,

      setUser: (user) =>
        set((state) => {
          state.user = user
        }),

      setTokens: (tokens) =>
        set((state) => {
          state.tokens = tokens
        }),

      login: (user, tokens) =>
        set((state) => {
          state.user = user
          state.tokens = tokens
          state.isAuthenticated = true
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.tokens = null
          state.isAuthenticated = false
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates)
          }
        }),

      setBiometricsEnabled: (enabled) =>
        set((state) => {
          state.biometricsEnabled = enabled
        }),

      setDeviceToken: (token) =>
        set((state) => {
          state.deviceToken = token
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        biometricsEnabled: state.biometricsEnabled,
      }),
    },
  ),
)

// ── Offline Queue Store ────────────────────────────────────────────

interface OfflineAction {
  id: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  timestamp: number
  retries: number
}

interface OfflineState {
  pendingActions: OfflineAction[]
  isOnline: boolean
  addAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => void
  removeAction: (id: string) => void
  clearActions: () => void
  setOnline: (online: boolean) => void
}

const offlineStorage = new MMKV({ id: 'edusuite-offline' })

export const useOfflineStore = create<OfflineState>()(
  persist(
    immer((set) => ({
      pendingActions: [],
      isOnline: true,

      addAction: (action) =>
        set((state) => {
          state.pendingActions.push({
            ...action,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            retries: 0,
          })
        }),

      removeAction: (id) =>
        set((state) => {
          state.pendingActions = state.pendingActions.filter((a) => a.id !== id)
        }),

      clearActions: () =>
        set((state) => {
          state.pendingActions = []
        }),

      setOnline: (online) =>
        set((state) => {
          state.isOnline = online
        }),
    })),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => offlineStorage.set(name, value),
        getItem: (name) => offlineStorage.getString(name) ?? null,
        removeItem: (name) => offlineStorage.delete(name),
      })),
    },
  ),
)
