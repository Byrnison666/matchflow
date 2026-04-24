import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { User } from '@/lib/types'

export default function PaymentSuccessScreen() {
  const setUser = useAuthStore((s) => s.setUser)
  const [status, setStatus] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get<User>('/users/me')
        setUser(data)
      } catch {
        // ignore
      } finally {
        setStatus('done')
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-primary items-center justify-center px-5">
      <View className="w-full rounded-[28px] border border-glass-border bg-card p-8 items-center">
        {status === 'loading' ? (
          <>
            <View className="w-14 h-14 rounded-full bg-accent-from mb-5 items-center justify-center">
              <ActivityIndicator color="#fff" />
            </View>
            <Text className="text-sm text-neutral-400">Подтверждаем оплату...</Text>
          </>
        ) : (
          <>
            <View className="w-16 h-16 rounded-full bg-accent-from items-center justify-center mb-5">
              <Text className="text-white text-3xl">✓</Text>
            </View>
            <Text className="mb-2 text-2xl font-bold text-white">Оплата прошла</Text>
            <Text className="mb-6 text-sm text-neutral-400 text-center">
              Твой аккаунт обновлён. Наслаждайся новыми возможностями!
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(app)/me')}
              className="w-full rounded-2xl bg-accent-from py-3.5 items-center"
            >
              <Text className="text-sm font-bold text-white">В профиль</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
