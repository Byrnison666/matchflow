import { create } from 'zustand'
import type { Match, Message } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

interface ChatState {
  matches: Match[]
  activeMatchId: string | null
  messages: Record<string, Message[]>
  unreadCounts: Record<string, number>
  isLoadingMatches: boolean
}

interface ChatActions {
  loadMatches: () => Promise<void>
  loadMessages: (matchId: string, cursor?: string) => Promise<void>
  addMessage: (matchId: string, message: Message) => void
  markRead: (matchId: string) => void
  setActiveMatch: (matchId: string | null) => void
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  matches: [],
  activeMatchId: null,
  messages: {},
  unreadCounts: {},
  isLoadingMatches: false,

  loadMatches: async () => {
    set({ isLoadingMatches: true })
    try {
      const { data } = await apiClient.get<{ data: Match[] }>('/matches')
      const unreadCounts = data.data.reduce<Record<string, number>>((acc, m) => {
        acc[m.id] = m.unreadCount
        return acc
      }, {})
      set({ matches: data.data, unreadCounts, isLoadingMatches: false })
    } catch {
      set({ isLoadingMatches: false })
    }
  },

  loadMessages: async (matchId, cursor) => {
    const params = cursor ? { cursor, limit: 40 } : { limit: 40 }
    const { data } = await apiClient.get<{ data: Message[]; nextCursor?: string }>(
      `/matches/${matchId}/messages`,
      { params },
    )
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: cursor
          ? [...data.data, ...(state.messages[matchId] ?? [])]
          : data.data,
      },
    }))
  },

  addMessage: (matchId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] ?? []), message],
      },
      matches: state.matches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: {
                text: message.text,
                createdAt: message.createdAt,
                messageType: message.messageType,
              },
              unreadCount:
                matchId !== state.activeMatchId
                  ? (state.unreadCounts[matchId] ?? 0) + 1
                  : 0,
            }
          : m,
      ),
    })),

  markRead: (matchId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [matchId]: 0 },
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, unreadCount: 0 } : m,
      ),
    })),

  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),
}))
