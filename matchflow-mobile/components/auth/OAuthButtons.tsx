import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as ExpoLinking from 'expo-linking'
import axios from 'axios'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { router } from 'expo-router'
import type { AuthResponse } from '@/lib/types'

type OAuthProvider = 'google' | 'yandex'

const PROVIDERS: Array<{
  id: OAuthProvider
  label: string
  icon: string
  bgColor: string
  textColor: string
}> = [
  {
    id: 'google',
    label: 'Google',
    icon: 'G',
    bgColor: '#ffffff',
    textColor: '#111111',
  },
  {
    id: 'yandex',
    label: 'Яндекс',
    icon: 'Я',
    bgColor: '#fc3f1d',
    textColor: '#ffffff',
  },
]

export function OAuthButtons() {
  const setUser = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState('')

  async function startOAuth(provider: OAuthProvider) {
    setError('')
    setLoadingProvider(provider)

    try {
      const redirectUri = ExpoLinking.createURL('/auth/oauth/callback')

      const { data } = await apiClient.get<{ url: string }>(`/auth/oauth/${provider}/url`, {
        params: { redirectUri },
      })

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

      if (result.type === 'success' && result.url) {
        const parsed = ExpoLinking.parse(result.url)
        const token = parsed.queryParams?.token as string | undefined
        const refreshToken = parsed.queryParams?.refreshToken as string | undefined

        if (token && refreshToken) {
          const { data: userData } = await apiClient.get<AuthResponse['user']>('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          setTokens(token, refreshToken)
          setUser(userData)
          router.replace(userData.isOnboarded ? '/(app)/discover' : '/(onboarding)')
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Backend недоступен. Запусти сервер')
        } else if (err.response.status === 400) {
          setError('OAuth не настроен на сервере')
        } else {
          setError('Backend отклонил OAuth-запрос')
        }
      } else {
        setError('Не удалось открыть вход через соцсеть')
      }
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <View className="mt-5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 h-px bg-white/10" />
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          или
        </Text>
        <View className="flex-1 h-px bg-white/10" />
      </View>

      <View className="flex-row gap-3">
        {PROVIDERS.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            disabled={loadingProvider !== null}
            onPress={() => startOAuth(provider.id)}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl px-3 py-3"
            style={{
              backgroundColor: provider.bgColor,
              opacity: loadingProvider !== null ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: provider.textColor }}>
                {provider.icon}
              </Text>
            </View>
            {loadingProvider === provider.id ? (
              <ActivityIndicator color={provider.textColor} size="small" />
            ) : (
              <Text className="text-sm font-bold" style={{ color: provider.textColor }}>
                {provider.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <Text className="mt-3 text-center text-xs text-error">{error}</Text>
      ) : null}
    </View>
  )
}
