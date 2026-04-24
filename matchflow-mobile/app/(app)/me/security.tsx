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
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { apiClient } from '@/lib/api/client'

export default function SecurityScreen() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setError('')
    if (form.next !== form.confirm) {
      setError('Пароли не совпадают')
      return
    }
    if (form.next.length < 8) {
      setError('Новый пароль — минимум 8 символов')
      return
    }
    setIsLoading(true)
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      })
      setSuccess(true)
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setError('Неверный текущий пароль')
    } finally {
      setIsLoading(false)
    }
  }

  const fields = [
    { field: 'current' as const, label: 'Текущий пароль' },
    { field: 'next' as const, label: 'Новый пароль' },
    { field: 'confirm' as const, label: 'Повтори новый пароль' },
  ]

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3 mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-neutral-400 text-base">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Безопасность</Text>
          </View>

          <View className="rounded-[26px] border border-glass-border bg-card/80 p-5">
            <Text className="mb-5 text-sm font-semibold text-white">Изменить пароль</Text>

            {success ? (
              <Text className="text-center text-sm text-green-400">Пароль успешно изменён</Text>
            ) : (
              <View className="gap-4">
                {fields.map(({ field, label }) => (
                  <View key={field}>
                    <Text className="mb-1.5 text-xs font-medium text-neutral-400">{label}</Text>
                    <TextInput
                      className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-white text-sm"
                      value={form[field]}
                      onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                      placeholder="••••••••"
                      placeholderTextColor="#3A3A3A"
                      secureTextEntry
                    />
                  </View>
                ))}

                {error ? (
                  <Text className="text-center text-xs text-red-400">{error}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className="mt-1 w-full rounded-2xl bg-accent-from py-4 items-center"
                  style={{ opacity: isLoading ? 0.6 : 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-sm font-bold text-white">Сменить пароль</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
