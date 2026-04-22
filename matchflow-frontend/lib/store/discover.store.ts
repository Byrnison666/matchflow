import { create } from 'zustand'
import type { Profile, Match } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

interface DiscoverState {
  profiles: Profile[]
  isLoading: boolean
  hasMore: boolean
  matchResult: Match | null
  cursor: string | null
}

interface DiscoverActions {
  loadFeed: () => Promise<void>
  removeTop: () => void
  recordSwipe: (targetId: string, direction: 'right' | 'left' | 'super') => Promise<void>
  clearMatch: () => void
}

export const useDiscoverStore = create<DiscoverState & DiscoverActions>((set, get) => ({
  profiles: [],
  isLoading: false,
  hasMore: true,
  matchResult: null,
  cursor: null,

  loadFeed: async () => {
    const { isLoading, hasMore, cursor } = get()
    if (isLoading || !hasMore) return

    set({ isLoading: true })
    try {
      const params = cursor ? { cursor, limit: 10 } : { limit: 10 }
      const response = await apiClient.get<{
        data: Profile[]
        nextCursor?: string
        hasMore: boolean
      }>('/discover/feed', { params })

      const { data: payload } = response
      set((state) => ({
        profiles: [...state.profiles, ...payload.data],
        hasMore: payload.hasMore,
        cursor: payload.nextCursor ?? null,
        isLoading: false,
      }))
    } catch {
      set({ isLoading: false })
    }
  },

  removeTop: () =>
    set((state) => ({ profiles: state.profiles.slice(1) })),

  recordSwipe: async (targetId, direction) => {
    const { removeTop } = get()
    removeTop()

    try {
      const { data } = await apiClient.post<{
        isMatch: boolean
        match?: Match
      }>('/discover/swipe', { targetId, direction })

      if (data.isMatch && data.match) {
        set({ matchResult: data.match })
      }

      const { profiles, hasMore } = get()
      if (profiles.length < 3 && hasMore) {
        get().loadFeed()
      }
    } catch {
      // swipe failure is non-blocking
    }
  },

  clearMatch: () => set({ matchResult: null }),
}))
