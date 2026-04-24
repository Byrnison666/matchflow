import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'

const INTERESTS = [
  'Путешествия', 'Музыка', 'Кино', 'Спорт', 'Готовка', 'Чтение',
  'Игры', 'Фото', 'Искусство', 'Танцы', 'Йога', 'Природа',
]

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    )
  }

  async function handleSave() {
    setIsLoading(true)
    try {
      await apiClient.put('/users/me', { name, bio, interests })
      setUser({ ...user, name })
      setSaved(true)
      setTimeout(() => router.back(), 800)
    } catch {
      // ignore
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
          contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3 mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-neutral-400 text-base">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Редактировать профиль</Text>
          </View>

          <View className="gap-5">
            <View>
              <Text className="mb-1.5 text-xs font-medium text-neutral-400">Имя</Text>
              <TextInput
                className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-white text-sm"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#3A3A3A"
                placeholder="Твоё имя"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-xs font-medium text-neutral-400">О себе</Text>
              <TextInput
                className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-white text-sm"
                value={bio}
                onChangeText={setBio}
                placeholder="Расскажи о себе..."
                placeholderTextColor="#3A3A3A"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>

            <View>
              <Text className="mb-3 text-xs font-medium text-neutral-400">Интересы</Text>
              <View className="flex-row flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1.5 ${
                      interests.includes(interest)
                        ? 'border-accent-from bg-accent-muted'
                        : 'border-glass-border bg-secondary'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        interests.includes(interest) ? 'text-accent-from' : 'text-neutral-300'
                      }`}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading || !name.trim()}
              className="mt-2 w-full rounded-2xl bg-accent-from py-4 items-center"
              style={{ opacity: isLoading || !name.trim() ? 0.6 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {saved ? 'Сохранено ✓' : 'Сохранить'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
