import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
        AsyncStorage.setItem('accessToken', accessToken)
        AsyncStorage.setItem('refreshToken', refreshToken)
        set({ accessToken })
      },

      logout: () => {
        AsyncStorage.removeItem('accessToken')
        AsyncStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null })
      },

      updateTier: (tier) =>
        set((state) => ({
          user: state.user ? { ...state.user, subscriptionTier: tier } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
