import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useChatStore } from '@/lib/store/chat.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { apiClient } from '@/lib/api/client'
import type { Message } from '@/lib/types'

const GIFTS = [
  { id: 'rose', name: 'Роза', emoji: '🌹', coinPrice: 10 },
  { id: 'heart', name: 'Сердце', emoji: '💖', coinPrice: 5 },
  { id: 'star', name: 'Звезда', emoji: '⭐', coinPrice: 15 },
  { id: 'cake', name: 'Торт', emoji: '🎂', coinPrice: 20 },
]

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  const user = useAuthStore((s) => s.user)
  const { messages, matches, loadMessages, addMessage, markRead, setActiveMatch } = useChatStore()

  const match = matches.find((m) => m.id === matchId)
  const chatMessages = messages[matchId] ?? []

  const [text, setText] = useState('')
  const [showGifts, setShowGifts] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    setActiveMatch(matchId)
    loadMessages(matchId).catch(() => {})
    markRead(matchId)
    return () => setActiveMatch(null)
  }, [matchId])

  useEffect(() => {
    if (chatMessages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true })
    }
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
      // non-blocking
    }
  }

  async function sendGift(giftId: string, giftName: string, giftEmoji: string) {
    if (!user) return
    setShowGifts(false)
    try {
      await apiClient.post(`/matches/${matchId}/messages`, {
        messageType: 'gift',
        metadata: { giftId, giftName, giftEmoji },
      })
    } catch {}
  }

  const isOnline = match?.partner.isOnline ?? false

  // Group messages by date
  const grouped = chatMessages.reduce<Array<{ date: string; msgs: Message[] }>>((acc, msg) => {
    const date = formatDate(msg.createdAt)
    const last = acc[acc.length - 1]
    if (last?.date === date) {
      last.msgs.push(msg)
    } else {
      acc.push({ date, msgs: [msg] })
    }
    return acc
  }, [])

  type FlatItem =
    | { type: 'date'; date: string; key: string }
    | { type: 'message'; msg: Message; isOwn: boolean; showAvatar: boolean; key: string }

  const flatItems: FlatItem[] = []
  grouped.forEach(({ date, msgs }) => {
    flatItems.push({ type: 'date', date, key: `date-${date}` })
    msgs.forEach((msg, i) => {
      const isOwn = msg.senderId === user?.id
      const showAvatar = !isOwn && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)
      flatItems.push({ type: 'message', msg, isOwn, showAvatar, key: msg.id })
    })
  })

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-3 border-b border-glass-border bg-primary/80">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Text className="text-neutral-400 text-base">←</Text>
        </TouchableOpacity>

        {match ? (
          <>
            <View className="relative flex-shrink-0">
              <View className="w-10 h-10 rounded-full overflow-hidden">
                <Image source={{ uri: match.theirPhoto }} className="w-full h-full" resizeMode="cover" />
              </View>
              {isOnline && (
                <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-primary" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">{match.theirName}</Text>
              <Text className="text-neutral-500 text-xs">
                {isOnline
                  ? 'онлайн'
                  : match.partner.lastSeenAt
                  ? `был(а) ${formatRelative(match.partner.lastSeenAt)}`
                  : 'не в сети'}
              </Text>
            </View>
          </>
        ) : (
          <Text className="text-white font-semibold text-sm flex-1">Чат</Text>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={flatItems}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View className="items-center py-3">
                  <View className="bg-neutral-700 rounded-full px-3 py-1">
                    <Text className="text-neutral-400 text-xs">{item.date}</Text>
                  </View>
                </View>
              )
            }
            return (
              <ChatBubble
                message={item.msg}
                isOwn={item.isOwn}
                showAvatar={item.showAvatar}
                avatarUrl={!item.isOwn ? match?.theirPhoto : undefined}
              />
            )
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {showGifts && (
          <View className="border-t border-glass-border bg-secondary px-4 py-3">
            <View className="flex-row gap-3">
              {GIFTS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => sendGift(g.id, g.name, g.emoji)}
                  className="flex-1 items-center gap-1 p-3 rounded-xl bg-card border border-glass-border"
                >
                  <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                  <Text className="text-white text-xs font-medium">{g.name}</Text>
                  <Text className="text-accent-from text-[10px]">{g.coinPrice} монет</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-end gap-2 px-4 py-3 border-t border-glass-border bg-primary">
          <TouchableOpacity
            onPress={() => setShowGifts((s) => !s)}
            className="w-10 h-10 rounded-full bg-card border border-glass-border items-center justify-center flex-shrink-0"
          >
            <Text style={{ fontSize: 18 }}>🎁</Text>
          </TouchableOpacity>

          <View className="flex-1 flex-row items-end bg-secondary rounded-2xl border border-glass-border px-4 py-2.5 gap-2">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Сообщение..."
              placeholderTextColor="#3A3A3A"
              className="flex-1 text-white text-sm"
              multiline
              style={{ maxHeight: 100 }}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-accent-from items-center justify-center flex-shrink-0"
            style={{ opacity: text.trim() ? 1 : 0.4 }}
          >
            <Text className="text-white text-base">➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
