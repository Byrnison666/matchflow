import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

const STORAGE_KEY = 'matchflow:notifications'

interface NotifSettings {
  newMatches: boolean
  messages: boolean
  likes: boolean
  systemUpdates: boolean
}

const DEFAULTS: NotifSettings = {
  newMatches: true,
  messages: true,
  likes: true,
  systemUpdates: false,
}

const ITEMS: Array<{ key: keyof NotifSettings; label: string; desc: string }> = [
  { key: 'newMatches', label: 'Новые мэтчи', desc: 'Когда у тебя новый мэтч' },
  { key: 'messages', label: 'Сообщения', desc: 'Входящие сообщения в чате' },
  { key: 'likes', label: 'Лайки', desc: 'Кто-то тебя лайкнул (Plus+)' },
  { key: 'systemUpdates', label: 'Обновления', desc: 'Новости и обновления приложения' },
]

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="relative h-6 w-11 rounded-full justify-center"
      style={{ backgroundColor: value ? '#FF4B6E' : '#1A1A1A' }}
      activeOpacity={0.8}
    >
      <View
        className="absolute w-5 h-5 rounded-full bg-white"
        style={{
          left: value ? 22 : 2,
          top: 2,
        }}
      />
    </TouchableOpacity>
  )
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULTS)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSettings(JSON.parse(raw)) } catch {}
      }
    })
  }, [])

  function toggle(key: keyof NotifSettings) {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-neutral-400 text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Уведомления</Text>
      </View>

      <View className="mx-5 rounded-[26px] border border-glass-border bg-card/80 overflow-hidden">
        {ITEMS.map((item, i) => (
          <View
            key={item.key}
            className={`flex-row items-center justify-between px-4 py-4 ${
              i < ITEMS.length - 1 ? 'border-b border-glass-border' : ''
            }`}
          >
            <View className="flex-1 mr-4">
              <Text className="text-sm font-medium text-white">{item.label}</Text>
              <Text className="text-xs text-neutral-500">{item.desc}</Text>
            </View>
            <Toggle value={settings[item.key]} onToggle={() => toggle(item.key)} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}
