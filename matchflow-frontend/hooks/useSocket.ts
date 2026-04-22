'use client'

import { useEffect, useState } from 'react'
import { type Socket } from 'socket.io-client'
import { createSocket, getSocket } from '@/lib/socket/socket'
import { useAuthStore } from '@/lib/store/auth.store'

export function useSocket() {
  const token = useAuthStore((s) => s.accessToken)
  const [socket, setSocket] = useState<Socket | null>(getSocket)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const s = createSocket(token)
    setSocket(s)

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)

    if (s.connected) setIsConnected(true)

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
    }
  }, [token])

  return { socket, isConnected }
}
