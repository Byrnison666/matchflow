import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import type { AuthResponse } from '@/lib/types'

export default function RegisterScreen() {
  const setUser = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (form.password.length < 8) {
      setError('Пароль — минимум 8 символов')
      return
    }
    setIsLoading(true)
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email: form.email,
        password: form.password,
      })
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      router.replace('/(onboarding)')
    } catch {
      setError('Этот email уже занят')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Text className="font-bold text-2xl text-white">
              Match<Text className="text-accent-from">Flow</Text>
            </Text>
            <Text className="text-neutral-400 text-sm mt-2">Создай аккаунт — это бесплатно</Text>
          </View>

          <View className="bg-card rounded-2xl p-6 border border-glass-border">
            <View className="mb-4">
              <Text className="text-neutral-400 text-xs font-medium mb-1.5">Email</Text>
              <TextInput
                className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="you@example.com"
                placeholderTextColor="#3A3A3A"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View className="mb-4">
              <Text className="text-neutral-400 text-xs font-medium mb-1.5">Пароль</Text>
              <TextInput
                className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                placeholder="минимум 8 символов"
                placeholderTextColor="#3A3A3A"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View className="mb-4">
              <Text className="text-neutral-400 text-xs font-medium mb-1.5">Повтори пароль</Text>
              <TextInput
                className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
                value={form.confirmPassword}
                onChangeText={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                placeholder="••••••••"
                placeholderTextColor="#3A3A3A"
                secureTextEntry
              />
            </View>

            {error ? (
              <Text className="text-error text-xs text-center mb-3">{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="w-full bg-accent-from rounded-xl py-3.5 items-center mt-1"
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">Создать аккаунт</Text>
              )}
            </TouchableOpacity>

            <OAuthButtons />

            <View className="flex-row justify-center mt-4">
              <Text className="text-neutral-500 text-sm">Уже есть аккаунт? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-accent-from text-sm">Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
