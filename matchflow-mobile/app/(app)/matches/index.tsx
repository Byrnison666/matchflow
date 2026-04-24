import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useChatStore } from '@/lib/store/chat.store'
import type { Match } from '@/lib/types'

type Tab = 'messages' | 'matches'

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
    <TouchableOpacity
      onPress={() => router.push(`/(app)/matches/${match.id}`)}
      className="items-center gap-1.5 mr-4"
    >
      <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent-from/60">
        <Image source={{ uri: match.theirPhoto }} className="w-full h-full" resizeMode="cover" />
        {match.partner.isOnline && (
          <View
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-primary"
          />
        )}
      </View>
      <Text className="text-white text-xs font-medium" numberOfLines={1} style={{ maxWidth: 64 }}>
        {match.theirName}
      </Text>
    </TouchableOpacity>
  )
}

function MessageRow({ match }: { match: Match }) {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const unread = unreadCounts[match.id] ?? 0

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/matches/${match.id}`)}
      className="flex-row items-center gap-3 px-5 py-3.5"
      activeOpacity={0.7}
    >
      <View className="relative flex-shrink-0">
        <View className="w-[52px] h-[52px] rounded-full overflow-hidden">
          <Image source={{ uri: match.theirPhoto }} className="w-full h-full" resizeMode="cover" />
        </View>
        {match.partner.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-primary" />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-sm font-semibold ${unread > 0 ? 'text-white' : 'text-neutral-200'}`}
            numberOfLines={1}
          >
            {match.theirName}
          </Text>
          {match.lastMessage ? (
            <Text className="text-neutral-500 text-xs flex-shrink-0">
              {formatTime(match.lastMessage.createdAt)}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-xs flex-1 ${unread > 0 ? 'text-neutral-300' : 'text-neutral-500'}`}
            numberOfLines={1}
          >
            {match.lastMessage
              ? match.lastMessage.messageType === 'gift'
                ? 'Подарок'
                : match.lastMessage.text
              : 'Начни диалог первым!'}
          </Text>
          {unread > 0 && (
            <View className="ml-2 w-5 h-5 rounded-full bg-accent-from items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function MatchesScreen() {
  const [tab, setTab] = useState<Tab>('messages')
  const { matches, isLoadingMatches, loadMatches } = useChatStore()

  useEffect(() => {
    if (matches.length === 0) loadMatches()
  }, [])

  const newMatches = matches.filter((m) => !m.lastMessage)
  const conversations = matches.filter((m) => m.lastMessage)

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-5 pt-3 pb-4">
        <Text className="font-bold text-2xl text-white mb-4">Сообщения</Text>
        <View className="flex-row bg-neutral-700 rounded-xl p-1">
          {(['messages', 'matches'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 items-center rounded-lg ${
                tab === t ? 'bg-card' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  tab === t ? 'text-white' : 'text-neutral-500'
                }`}
              >
                {t === 'messages' ? 'Чаты' : 'Мэтчи'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoadingMatches ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF4B6E" />
        </View>
      ) : tab === 'matches' ? (
        newMatches.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl mb-4">💘</Text>
            <Text className="text-neutral-400 text-sm">Пока нет новых мэтчей — свайпай дальше!</Text>
          </View>
        ) : (
          <FlatList
            data={newMatches}
            keyExtractor={(m) => m.id}
            horizontal
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
            renderItem={({ item }) => <MatchThumbnail match={item} />}
          />
        )
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-5xl mb-4">💬</Text>
          <Text className="text-neutral-400 text-sm">Начни первым разговор со своими мэтчами</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageRow match={item} />}
        />
      )}
    </SafeAreaView>
  )
}
