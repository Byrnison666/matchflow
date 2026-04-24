import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'

const INTERESTS = [
  'Музыка', 'Путешествия', 'Еда', 'Спорт', 'Кино', 'Книги',
  'Фото', 'Танцы', 'Йога', 'Готовка', 'Игры', 'Искусство',
  'Природа', 'Фитнес', 'Кофе', 'Собаки', 'Кошки', 'Технологии',
]

const GENDERS = [
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
  { value: 'non_binary', label: 'Небинарный' },
  { value: 'other', label: 'Другое' },
]

const TOTAL_STEPS = 4

interface Step1Data { name: string; birthdate: string; gender: string }
interface Step3Data { bio: string; interests: string[] }
interface PickedPhoto { uri: string; type: string; name: string }

function ProgressBar({ step }: { step: number }) {
  return (
    <View className="flex-row gap-1.5 px-6 pt-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} className="flex-1 h-1 rounded-full bg-neutral-700 overflow-hidden">
          <View
            className="h-full bg-accent-from"
            style={{ width: i < step ? '100%' : '0%' }}
          />
        </View>
      ))}
    </View>
  )
}

function Step1({ data, onChange }: { data: Step1Data; onChange: (d: Partial<Step1Data>) => void }) {
  const maxDate = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]

  return (
    <View className="gap-5">
      <View>
        <Text className="font-bold text-2xl text-white mb-1">Как тебя зовут?</Text>
        <Text className="text-neutral-400 text-sm">Это будет видно другим пользователям</Text>
      </View>

      <View>
        <Text className="text-neutral-400 text-xs font-medium mb-1.5">Имя</Text>
        <TextInput
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
          value={data.name}
          onChangeText={(v) => onChange({ name: v })}
          placeholder="Твоё имя"
          placeholderTextColor="#3A3A3A"
        />
      </View>

      <View>
        <Text className="text-neutral-400 text-xs font-medium mb-1.5">Дата рождения (ГГГГ-ММ-ДД)</Text>
        <TextInput
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
          value={data.birthdate}
          onChangeText={(v) => onChange({ birthdate: v })}
          placeholder={maxDate}
          placeholderTextColor="#3A3A3A"
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View>
        <Text className="text-neutral-400 text-xs font-medium mb-2">Пол</Text>
        <View className="flex-row flex-wrap gap-2">
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              onPress={() => onChange({ gender: g.value })}
              className={`flex-1 py-3 rounded-xl border items-center ${
                data.gender === g.value
                  ? 'bg-accent-muted border-accent-from'
                  : 'bg-secondary border-glass-border'
              }`}
              style={{ minWidth: '45%' }}
            >
              <Text
                className={`text-sm font-medium ${
                  data.gender === g.value ? 'text-accent-from' : 'text-neutral-300'
                }`}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

function Step2({
  photos,
  onChange,
}: {
  photos: PickedPhoto[]
  onChange: (files: PickedPhoto[]) => void
}) {
  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => ({
        uri: a.uri,
        type: a.mimeType ?? 'image/jpeg',
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
      }))
      onChange([...photos, ...newPhotos].slice(0, 6))
    }
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="font-bold text-2xl text-white mb-1">Добавь фото</Text>
        <Text className="text-neutral-400 text-sm">Минимум 1, максимум 6. Первое — главное.</Text>
      </View>

      <TouchableOpacity
        onPress={pickPhotos}
        className="border-2 border-dashed border-neutral-600 rounded-xl p-6 items-center"
      >
        <Text className="text-3xl mb-2">📷</Text>
        <Text className="text-neutral-400 text-sm">
          Нажми чтобы <Text className="text-accent-from">выбрать фото</Text>
        </Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((photo, i) => (
            <View
              key={i}
              className="relative rounded-xl overflow-hidden bg-neutral-700"
              style={{ width: '31%', aspectRatio: 1 }}
            >
              <Image source={{ uri: photo.uri }} className="w-full h-full" resizeMode="cover" />
              {i === 0 && (
                <View className="absolute top-1 left-1 bg-accent-from rounded-full px-1.5 py-0.5">
                  <Text className="text-white text-[9px] font-bold">Главное</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
              >
                <Text className="text-white text-xs">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

function Step3({ data, onChange }: { data: Step3Data; onChange: (d: Partial<Step3Data>) => void }) {
  function toggleInterest(interest: string) {
    const current = data.interests
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest].slice(0, 10)
    onChange({ interests: next })
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="font-bold text-2xl text-white mb-1">О себе</Text>
        <Text className="text-neutral-400 text-sm">Коротко и честно — это привлекает</Text>
      </View>

      <View>
        <Text className="text-neutral-400 text-xs font-medium mb-1.5">
          Биография ({data.bio.length}/300)
        </Text>
        <TextInput
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
          value={data.bio}
          onChangeText={(v) => onChange({ bio: v.slice(0, 300) })}
          placeholder="Расскажи пару слов о себе..."
          placeholderTextColor="#3A3A3A"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />
      </View>

      <View>
        <Text className="text-neutral-400 text-xs font-medium mb-2">
          Интересы ({data.interests.length}/10)
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full border ${
                data.interests.includes(interest)
                  ? 'bg-accent-muted border-accent-from'
                  : 'bg-secondary border-glass-border'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  data.interests.includes(interest) ? 'text-accent-from' : 'text-neutral-300'
                }`}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

function Step4({ onComplete }: { onComplete: (lat?: number, lng?: number) => void }) {
  const [manual, setManual] = useState(false)
  const [city, setCity] = useState('')
  const [searching, setSearching] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [requestingGps, setRequestingGps] = useState(false)

  async function handleAllowGps() {
    setRequestingGps(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        onComplete(loc.coords.latitude, loc.coords.longitude)
      } else {
        onComplete()
      }
    } catch {
      onComplete()
    } finally {
      setRequestingGps(false)
    }
  }

  async function handleManualSubmit() {
    if (!city.trim()) return
    setSearching(true)
    setGeoError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'ru' } },
      )
      const results = (await res.json()) as Array<{ lat: string; lon: string }>
      if (!results.length) {
        setGeoError('Город не найден. Попробуй ещё раз.')
        return
      }
      const { lat, lon } = results[0]
      onComplete(parseFloat(lat), parseFloat(lon))
    } catch {
      setGeoError('Ошибка поиска. Проверь подключение.')
    } finally {
      setSearching(false)
    }
  }

  if (manual) {
    return (
      <View className="gap-6 items-center">
        <Text className="text-6xl">📍</Text>
        <View className="items-center">
          <Text className="font-bold text-2xl text-white mb-2">Укажи город</Text>
          <Text className="text-neutral-400 text-sm text-center leading-relaxed">
            Введи название города — мы найдём людей рядом.
          </Text>
        </View>
        <View className="w-full gap-3">
          <TextInput
            className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm"
            value={city}
            onChangeText={setCity}
            placeholder="Москва, Санкт-Петербург..."
            placeholderTextColor="#3A3A3A"
          />
          {geoError ? <Text className="text-xs text-red-400 text-center">{geoError}</Text> : null}
          <TouchableOpacity
            onPress={handleManualSubmit}
            disabled={!city.trim() || searching}
            className="w-full bg-accent-from rounded-xl py-3.5 items-center"
            style={{ opacity: !city.trim() || searching ? 0.6 : 1 }}
          >
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">Подтвердить</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setManual(false)}>
          <Text className="text-neutral-500 text-sm">← Назад</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="gap-6 items-center">
      <Text className="text-6xl">📍</Text>
      <View className="items-center">
        <Text className="font-bold text-2xl text-white mb-2">Включи геолокацию</Text>
        <Text className="text-neutral-400 text-sm text-center leading-relaxed">
          Мы используем твоё местоположение только для показа людей поблизости. Точные координаты никому не передаются.
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleAllowGps}
        disabled={requestingGps}
        className="w-full bg-accent-from rounded-xl py-3.5 items-center"
        style={{ opacity: requestingGps ? 0.6 : 1 }}
      >
        {requestingGps ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-sm">Разрешить геолокацию</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setManual(true)}>
        <Text className="text-neutral-500 text-sm">Задать вручную</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function OnboardingScreen() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [step1, setStep1] = useState<Step1Data>({ name: '', birthdate: '', gender: '' })
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [step3, setStep3] = useState<Step3Data>({ bio: '', interests: [] })

  const canNext = useCallback(() => {
    if (step === 1) return step1.name.trim().length >= 2 && step1.birthdate && step1.gender
    if (step === 2) return photos.length >= 1
    if (step === 3) return true
    return false
  }, [step, step1, photos])

  async function handleComplete(lat?: number, lng?: number) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', step1.name)
      formData.append('birthdate', step1.birthdate)
      formData.append('gender', step1.gender)
      formData.append('bio', step3.bio)
      step3.interests.forEach((i) => formData.append('interests[]', i))
      photos.forEach((p) =>
        formData.append('photos', { uri: p.uri, type: p.type, name: p.name } as unknown as Blob),
      )

      if (lat !== undefined && lng !== undefined) {
        await apiClient.post('/users/me/location', { lat, lng }).catch(() => {})
      }

      await apiClient.post('/users/me/onboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (user) setUser({ ...user, isOnboarded: true, name: step1.name })
    } catch {
      // proceed regardless — backend may still process
    } finally {
      setIsSubmitting(false)
      router.replace('/(app)/discover')
    }
  }

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }

  function back() {
    if (step > 1) setStep((s) => s - 1)
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ProgressBar step={step} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && <Step1 data={step1} onChange={(d) => setStep1((s) => ({ ...s, ...d }))} />}
          {step === 2 && <Step2 photos={photos} onChange={setPhotos} />}
          {step === 3 && <Step3 data={step3} onChange={(d) => setStep3((s) => ({ ...s, ...d }))} />}
          {step === 4 && <Step4 onComplete={handleComplete} />}

          {step < 4 && (
            <View className="flex-row gap-3 mt-8">
              {step > 1 && (
                <TouchableOpacity
                  onPress={back}
                  className="bg-secondary border border-glass-border rounded-xl px-6 py-3.5 items-center"
                >
                  <Text className="text-white font-medium text-sm">Назад</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={next}
                disabled={!canNext() || isSubmitting}
                className="flex-1 bg-accent-from rounded-xl py-3.5 items-center"
                style={{ opacity: !canNext() || isSubmitting ? 0.4 : 1 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    {step === TOTAL_STEPS - 1 ? 'Готово' : 'Далее'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
