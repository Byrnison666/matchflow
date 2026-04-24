'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Message } from '@/lib/types'
import { messageVariants } from '@/lib/animations'

interface ChatBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  avatarUrl?: string
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <span className="opacity-40">●</span>
  if (status === 'sent') return <span className="text-neutral-400">✓</span>
  return <span className="text-accent-from">✓✓</span>
}

export function ChatBubble({ message, isOwn, showAvatar, avatarUrl }: ChatBubbleProps) {
  const bubbleBase = 'max-w-[75%] px-4 py-2.5 rounded-[22px] text-sm leading-relaxed break-words shadow-glass'
  const ownStyle = `${bubbleBase} bg-chat-gradient text-white rounded-br-md`
  const theirStyle = `${bubbleBase} border border-white/10 bg-white/[0.075] text-neutral-100 rounded-bl-md backdrop-blur-xl`

  function renderContent() {
    if (message.messageType === 'gift' && message.metadata) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{message.metadata.giftEmoji}</span>
          <span className="text-sm font-medium">{message.metadata.giftName}</span>
        </div>
      )
    }

    if (message.messageType === 'date_invite' && message.metadata) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>Приглашение на свидание</span>
          </div>
          {message.metadata.venue && (
            <p className="text-xs opacity-75">{message.metadata.venue}</p>
          )}
          {message.metadata.date && (
            <p className="text-xs opacity-75">{message.metadata.date}</p>
          )}
        </div>
      )
    }

    return <span>{message.text}</span>
  }

  return (
    <motion.div
      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      variants={messageVariants}
      initial="initial"
      animate="animate"
    >
      {!isOwn && showAvatar && (
        <div className="relative mb-1 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-neutral-600" />
          )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-7 flex-shrink-0" />}

      <div className={`relative overflow-hidden ${isOwn ? ownStyle : theirStyle}`}>
        {isOwn && (
          <div className="pointer-events-none absolute -right-6 -top-8 h-16 w-16 rounded-full bg-white/20 blur-2xl" />
        )}
        <div className="relative">
        {renderContent()}
        <div
          className={`flex items-center gap-1 mt-1 text-[10px] ${
            isOwn ? 'justify-end text-white/60' : 'justify-start text-neutral-500'
          } ${message.status === 'sending' ? 'opacity-60' : ''}`}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
        </div>
      </div>
    </motion.div>
  )
}
