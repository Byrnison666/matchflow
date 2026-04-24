import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { User } from '@/lib/types'

const TIER_LABELS = { free: 'Free', plus: 'Plus', gold: 'Gold' }
const TIER_COLORS: Record<string, string> = {
  free: '#6B6B6B',
  plus: '#60a5fa',
  gold: '#facc15',
}

interface Stats {
  views: number
  likes: number
  matches: number
}

function deriveBadges(user: User, stats: Stats | null) {
  return [
    { icon: '✅', label: 'Верификация', earned: user.isVerified },
    { icon: '💬', label: 'Первый диалог', earned: (stats?.matches ?? 0) >= 1 },
    { icon: '❤️', label: 'Первый мэтч', earned: (stats?.matches ?? 0) >= 1 },
    { icon: '🔥', label: '7 дней подряд', earned: user.streakDays >= 7 },
    { icon: '⭐', label: '10 мэтчей', earned: (stats?.matches ?? 0) >= 10 },
  ]
}

export default function MyProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  const [showLogout, setShowLogout] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    apiClient.get<Stats>('/users/me/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  if (!user) return null

  function handleLogout() {
    logout()
    router.replace('/(auth)/login')
  }

  async function handlePhotoChange() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return

    setUploading(true)
    try {
      const asset = result.assets[0]
      const formData = new FormData()
      formData.append('photo', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'photo.jpg',
      } as unknown as Blob)

      const { data } = await apiClient.post<{ photo: string }>('/users/me/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser({ ...user, photo: data.photo })
    } catch {
      // silently ignore
    } finally {
      setUploading(false)
    }
  }

  const badges = deriveBadges(user, stats)
  const displayStats = [
    { label: 'Просмотры', value: stats ? String(stats.views) : '—' },
    { label: 'Лайки', value: stats ? String(stats.likes) : '—' },
    { label: 'Мэтчи', value: stats ? String(stats.matches) : '—' },
  ]

  const menuItems = [
    { label: 'Редактировать профиль', icon: '✎', onPress: () => router.push('/(app)/me/edit') },
    { label: 'Настройки поиска', icon: '⚙️', onPress: () => router.push('/(app)/me/search') },
    { label: 'Уведомления', icon: '🔔', onPress: () => router.push('/(app)/me/notifications') },
    { label: 'Безопасность', icon: '🔒', onPress: () => router.push('/(app)/me/security') },
    { label: 'Premium', icon: '✨', onPress: () => router.push('/premium') },
  ]

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              Control room
            </Text>
            <Text className="text-3xl font-bold text-white">Профиль</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowLogout(true)}
            className="rounded-full border border-glass-border bg-white/5 px-3 py-1.5"
          >
            <Text className="text-sm text-neutral-400">Выйти</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5 mb-4 rounded-[32px] border border-glass-border bg-card p-5">
          <View className="items-center">
            <View className="relative mb-4">
              <View className="w-28 h-28 rounded-full overflow-hidden border-2 border-glass-border bg-neutral-700">
                {user.photo ? (
                  <Image source={{ uri: user.photo }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-4xl text-white">{user.name[0]}</Text>
                  </View>
                )}
                {uploading && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={handlePhotoChange}
                disabled={uploading}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-accent-from items-center justify-center border-2 border-primary"
              >
                <Text className="text-white text-xs">✎</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-2xl font-bold text-white">{user.name}</Text>
            <Text className="text-sm font-bold mt-0.5" style={{ color: TIER_COLORS[user.subscriptionTier] }}>
              {TIER_LABELS[user.subscriptionTier]}
            </Text>

            {user.subscriptionTier === 'free' && (
              <TouchableOpacity
                onPress={() => router.push('/premium')}
                className="mt-3 bg-accent-from rounded-full px-4 py-2"
              >
                <Text className="text-xs font-bold text-white">Улучшить до Plus</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="mx-5 mb-4 gap-3">
          <View className="rounded-[26px] border border-glass-border bg-card/80 p-4">
            <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
              Активность
            </Text>
            <View className="flex-row gap-2">
              {displayStats.map((s) => (
                <View key={s.label} className="flex-1 rounded-2xl bg-white/5 p-3 items-center">
                  <Text className="text-2xl font-bold text-white">{s.value}</Text>
                  <Text className="mt-0.5 text-xs text-neutral-500">{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[26px] border border-glass-border bg-card/80 p-4">
              <Text className="text-2xl mb-2">🔥</Text>
              <Text className="text-sm font-semibold text-white">Серия</Text>
              <Text className="text-xs text-neutral-500">Дней подряд</Text>
              <Text className="mt-3 text-3xl font-bold text-white">{user.streakDays}</Text>
            </View>

            <View
              className="flex-1 rounded-[26px] p-4"
              style={{ borderWidth: 1, borderColor: 'rgba(250,204,21,0.14)', backgroundColor: 'rgba(250,204,21,0.07)' }}
            >
              <Text className="text-2xl mb-2">🪙</Text>
              <Text className="text-sm font-semibold text-white">Монеты</Text>
              <Text className="text-xs text-neutral-500">Подарки и буст</Text>
              <Text className="mt-3 text-3xl font-bold text-yellow-300">{user.coins}</Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mb-4 rounded-[26px] border border-glass-border bg-card/80 p-4">
          <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
            Достижения
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {badges.map((b) => (
              <View
                key={b.label}
                className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                  b.earned
                    ? 'border-accent-from/40 bg-accent-muted'
                    : 'border-neutral-700 bg-neutral-700/50'
                }`}
              >
                <Text style={{ opacity: b.earned ? 1 : 0.4 }}>{b.icon}</Text>
                <Text
                  className={`text-xs font-medium ${b.earned ? 'text-white' : 'text-neutral-600'}`}
                >
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-5 rounded-[26px] border border-glass-border bg-card/80 overflow-hidden">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center justify-between px-4 py-3.5 ${
                i < menuItems.length - 1 ? 'border-b border-glass-border' : ''
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Text className="w-6 text-center text-lg">{item.icon}</Text>
                <Text className="text-sm text-white">{item.label}</Text>
              </View>
              <Text className="text-xs text-neutral-600">›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showLogout}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogout(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-end p-4"
          onPress={() => setShowLogout(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-2xl border border-glass-border bg-card p-5">
              <Text className="mb-4 text-center font-semibold text-white">Выйти из аккаунта?</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowLogout(false)}
                  className="flex-1 rounded-xl bg-neutral-700 py-3 items-center"
                >
                  <Text className="text-sm font-medium text-white">Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-1 rounded-xl bg-error py-3 items-center"
                >
                  <Text className="text-sm font-semibold text-white">Выйти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
