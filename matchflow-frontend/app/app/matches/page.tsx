'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useChatStore } from '@/lib/store/chat.store'
import { useAuthStore } from '@/lib/store/auth.store'
import type { Match } from '@/lib/types'

type Tab = 'matches' | 'messages'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('ru-RU', { weekday: 'short' })
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function MatchThumbnail({ match }: { match: Match }) {
  return (
    <Link href={`/app/chat/${match.id}`}>
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-1.5"
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent-from/60">
          <Image src={match.theirPhoto} alt={match.theirName} fill className="object-cover" />
          {match.partner.isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-primary" />
          )}
        </div>
        <span className="text-white text-xs font-medium truncate w-16 text-center">
          {match.theirName}
        </span>
      </motion.div>
    </Link>
  )
}

function MessageRow({ match }: { match: Match }) {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const unread = unreadCounts[match.id] ?? 0

  return (
    <Link href={`/app/chat/${match.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-800/50 transition-colors"
      >
        <div className="relative flex-shrink-0">
          <div className="w-13 h-13 relative w-[52px] h-[52px] rounded-full overflow-hidden">
            <Image src={match.theirPhoto} alt={match.theirName} fill className="object-cover" />
          </div>
          {match.partner.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className={`text-sm font-semibold ${unread > 0 ? 'text-white' : 'text-neutral-200'}`}>
              {match.theirName}
            </span>
            {match.lastMessage && (
              <span className="text-neutral-500 text-xs flex-shrink-0">
                {formatTime(match.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-xs truncate ${unread > 0 ? 'text-neutral-300' : 'text-neutral-500'}`}>
              {match.lastMessage
                ? match.lastMessage.messageType === 'gift'
                  ? 'Подарок'
                  : match.lastMessage.text
                : 'Начни диалог первым!'}
            </p>
            {unread > 0 && (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-from text-white text-[10px] font-bold flex items-center justify-center ml-2">
                {unread}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('messages')
  const { matches, isLoadingMatches, loadMatches } = useChatStore()

  useEffect(() => {
    if (matches.length === 0) loadMatches()
  }, [])

  const newMatches = matches.filter((m) => !m.lastMessage)
  const conversations = matches.filter((m) => m.lastMessage)

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display font-bold text-2xl text-white mb-4">Сообщения</h1>

        <div className="flex gap-1 bg-neutral-800 rounded-xl p-1">
          {(['messages', 'matches'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === t ? 'bg-card text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {t === 'messages' ? 'Чаты' : 'Мэтчи'}
            </button>
          ))}
        </div>
      </div>

      {isLoadingMatches ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-coral-gradient animate-pulse" />
        </div>
      ) : tab === 'matches' ? (
        <div className="px-5">
          {newMatches.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">💘</div>
              <p className="text-neutral-400 text-sm">Пока нет новых мэтчей — свайпай дальше!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 pt-2">
              {newMatches.map((m) => (
                <MatchThumbnail key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1">
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-neutral-400 text-sm">Начни первым разговор со своими мэтчами</p>
            </div>
          ) : (
            conversations.map((m) => <MessageRow key={m.id} match={m} />)
          )}
        </div>
      )}
    </div>
  )
}
