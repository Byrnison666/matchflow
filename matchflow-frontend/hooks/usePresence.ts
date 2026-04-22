'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'

interface PresenceEntry {
  isOnline: boolean
  lastSeenAt: string | null
}

export function usePresence() {
  const { socket } = useSocket()
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceEntry>>(new Map())

  useEffect(() => {
    if (!socket) return

    const handler = (payload: { userId: string; isOnline: boolean; lastSeenAt: string | null }) => {
      setPresenceMap((prev) => {
        const next = new Map(prev)
        next.set(payload.userId, {
          isOnline: payload.isOnline,
          lastSeenAt: payload.lastSeenAt,
        })
        return next
      })
    }

    socket.on('presence:update', handler)
    return () => { socket.off('presence:update', handler) }
  }, [socket])

  const getPresence = useCallback(
    (userId: string): PresenceEntry => {
      return presenceMap.get(userId) ?? { isOnline: false, lastSeenAt: null }
    },
    [presenceMap]
  )

  return { getPresence }
}
