import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, SubscriptionTier } from '@/lib/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  updateTier: (tier: SubscriptionTier) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refreshToken)
          document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`
        }
        set({ accessToken })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken')
          document.cookie = 'access_token=; path=/; max-age=0'
        }
        set({ user: null, accessToken: null })
      },

      updateTier: (tier) =>
        set((state) => ({
          user: state.user ? { ...state.user, subscriptionTier: tier } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
)
