import { View, Text, Image } from 'react-native'
import type { Message } from '@/lib/types'

interface ChatBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  avatarUrl?: string
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <Text style={{ opacity: 0.4, color: '#fff' }}>●</Text>
  if (status === 'sent') return <Text className="text-neutral-400">✓</Text>
  return <Text className="text-accent-from">✓✓</Text>
}

function renderContent(message: Message) {
  if (message.messageType === 'gift' && message.metadata) {
    return (
      <View className="flex-row items-center gap-2">
        <Text style={{ fontSize: 24 }}>{message.metadata.giftEmoji}</Text>
        <Text className="text-sm font-medium text-white">{message.metadata.giftName}</Text>
      </View>
    )
  }

  if (message.messageType === 'date_invite' && message.metadata) {
    return (
      <View className="gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text>📅</Text>
          <Text className="font-medium text-white">Приглашение на свидание</Text>
        </View>
        {message.metadata.venue ? (
          <Text className="text-xs text-white/75">{message.metadata.venue}</Text>
        ) : null}
        {message.metadata.date ? (
          <Text className="text-xs text-white/75">{message.metadata.date}</Text>
        ) : null}
      </View>
    )
  }

  return <Text className="text-sm leading-relaxed text-white">{message.text}</Text>
}

export function ChatBubble({ message, isOwn, showAvatar, avatarUrl }: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <View className={`flex-row items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && showAvatar && (
        <View className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden border border-glass-border mb-1">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-neutral-600" />
          )}
        </View>
      )}
      {!isOwn && !showAvatar && <View className="w-7 flex-shrink-0" />}

      <View
        className="max-w-[75%] px-4 py-2.5 rounded-[22px] break-words"
        style={
          isOwn
            ? {
                backgroundColor: '#FF4B6E',
                borderBottomRightRadius: 6,
              }
            : {
                backgroundColor: 'rgba(255,255,255,0.075)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderBottomLeftRadius: 6,
              }
        }
      >
        {renderContent(message)}
        <View
          className={`flex-row items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
          style={{ opacity: message.status === 'sending' ? 0.6 : 1 }}
        >
          <Text className="text-[10px] text-white/60">{time}</Text>
          {isOwn && <StatusIcon status={message.status} />}
        </View>
      </View>
    </View>
  )
}
