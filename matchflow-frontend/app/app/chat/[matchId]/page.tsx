'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { useChatStore } from '@/lib/store/chat.store'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/store/auth.store'
import { usePresence } from '@/hooks/usePresence'
import { apiClient } from '@/lib/api/client'
import type { Message } from '@/lib/types'

const GIFTS = [
  { id: 'rose', name: 'Роза', emoji: '🌹', coinPrice: 10 },
  { id: 'heart', name: 'Сердце', emoji: '💖', coinPrice: 5 },
  { id: 'star', name: 'Звезда', emoji: '⭐', coinPrice: 15 },
  { id: 'cake', name: 'Торт', emoji: '🎂', coinPrice: 20 },
]

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { messages, matches, loadMessages, addMessage, markRead, setActiveMatch } = useChatStore()
  const { socket } = useSocket()
  const { getPresence } = usePresence()

  const match = matches.find((m) => m.id === matchId)
  const chatMessages = messages[matchId] ?? []

  const [text, setText] = useState('')
  const [showGifts, setShowGifts] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setActiveMatch(matchId)
    loadMessages(matchId)
    markRead(matchId)
    return () => setActiveMatch(null)
  }, [matchId])

  useEffect(() => {
    if (!socket) return
    socket.emit('chat:join', { matchId })

    const handler = (message: Message) => {
      if (message.matchId === matchId) {
        addMessage(matchId, message)
        markRead(matchId)
      }
    }
    socket.on('chat:message', handler)
    return () => {
      socket.off('chat:message', handler)
      socket.emit('chat:leave', { matchId })
    }
  }, [socket, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  async function sendMessage() {
    if (!text.trim() || !user) return
    const content = text.trim()
    setText('')

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      matchId,
      senderId: user.id,
      text: content,
      messageType: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
    }
    addMessage(matchId, optimistic)

    try {
      await apiClient.post(`/matches/${matchId}/messages`, { text: content })
    } catch {
      // message failed — could mark as failed in production
    }
  }

  async function sendGift(giftId: string, giftName: string, giftEmoji: string, coinPrice: number) {
    if (!user) return
    setShowGifts(false)
    try {
      await apiClient.post(`/matches/${matchId}/messages`, {
        messageType: 'gift',
        metadata: { giftId, giftName, giftEmoji },
      })
    } catch {
      // handle insufficient coins
    }
  }

  const presence = match ? getPresence(match.partner.id) : null
  const isOnline = presence?.isOnline ?? match?.partner.isOnline ?? false

  const grouped = chatMessages.reduce<Array<{ date: string; msgs: Message[] }>>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    const last = acc[acc.length - 1]
    if (last?.date === date) {
      last.msgs.push(msg)
    } else {
      acc.push({ date, msgs: [msg] })
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-glass-border bg-primary/80 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors p-1"
        >
          ←
        </button>

        {match && (
          <>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                <Image src={match.theirPhoto} alt={match.theirName} fill className="object-cover" />
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-primary" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{match.theirName}</p>
              <p className="text-neutral-500 text-xs">
                {isOnline ? 'онлайн' : presence?.lastSeenAt ? `был(а) ${formatRelative(presence.lastSeenAt)}` : 'не в сети'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="text-center py-3">
              <span className="text-neutral-600 text-xs bg-neutral-800 px-3 py-1 rounded-full">{date}</span>
            </div>
            {msgs.map((msg, i) => {
              const isOwn = msg.senderId === user?.id
              const showAvatar = !isOwn && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatarUrl={!isOwn ? match?.theirPhoto : undefined}
                />
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Gifts panel */}
      {showGifts && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-glass-border bg-secondary px-4 py-3"
        >
          <div className="flex gap-3">
            {GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => sendGift(g.id, g.name, g.emoji, g.coinPrice)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-glass-border hover:border-accent-from transition-colors"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-white text-xs font-medium">{g.name}</span>
                <span className="text-accent-from text-[10px]">{g.coinPrice} монет</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-glass-border bg-primary safe-bottom">
        <button
          onClick={() => setShowGifts((s) => !s)}
          className="w-10 h-10 rounded-full bg-card border border-glass-border flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0"
        >
          🎁
        </button>

        <div className="flex-1 flex items-end bg-secondary rounded-2xl border border-glass-border px-4 py-2.5 gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Сообщение..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none"
          />
        </div>

        <motion.button
          onClick={sendMessage}
          disabled={!text.trim()}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-coral-gradient flex items-center justify-center text-white shadow-glow disabled:opacity-40 flex-shrink-0 transition-opacity"
        >
          ➤
        </motion.button>
      </div>
    </div>
  )
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
