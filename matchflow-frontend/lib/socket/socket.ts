import { io, Socket } from 'socket.io-client'

let instance: Socket | null = null

export function createSocket(token: string): Socket {
  if (instance?.connected) return instance

  instance = io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  return instance
}

export function getSocket(): Socket | null {
  return instance
}

export function disconnectSocket(): void {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
