import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

const STORAGE_KEY = 'matchflow:search_settings'

interface SearchSettings {
  ageMin: number
  ageMax: number
  distanceKm: number
  genderPref: 'all' | 'women' | 'men'
}

const DEFAULTS: SearchSettings = { ageMin: 18, ageMax: 45, distanceKm: 25, genderPref: 'all' }
const DISTANCES = [5, 10, 25, 50, 100]
const GENDER_OPTIONS: Array<{ value: SearchSettings['genderPref']; label: string }> = [
  { value: 'all', label: 'Всех' },
  { value: 'women', label: 'Женщин' },
  { value: 'men', label: 'Мужчин' },
]

export default function SearchSettingsScreen() {
  const [settings, setSettings] = useState<SearchSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSettings(JSON.parse(raw)) } catch {}
      }
    })
  }, [])

  function update<K extends keyof SearchSettings>(key: K, value: SearchSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => router.back(), 700)
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 80 }}
      >
        <View className="flex-row items-center gap-3 mb-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-neutral-400 text-base">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Настройки поиска</Text>
        </View>

        <View className="gap-6">
          <View>
            <Text className="mb-3 text-xs font-medium text-neutral-400">Возраст</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-neutral-500 text-[10px] mb-1">От</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => update('ageMin', Math.max(18, settings.ageMin - 1))}
                    className="bg-secondary border border-glass-border rounded-xl w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <View className="flex-1 bg-secondary border border-glass-border rounded-xl py-2.5 items-center">
                    <Text className="text-white text-sm">{settings.ageMin}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      update('ageMin', Math.min(settings.ageMax - 1, settings.ageMin + 1))
                    }
                    className="bg-secondary border border-glass-border rounded-xl w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-neutral-600 mt-4">—</Text>
              <View className="flex-1">
                <Text className="text-neutral-500 text-[10px] mb-1">До</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      update('ageMax', Math.max(settings.ageMin + 1, settings.ageMax - 1))
                    }
                    className="bg-secondary border border-glass-border rounded-xl w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <View className="flex-1 bg-secondary border border-glass-border rounded-xl py-2.5 items-center">
                    <Text className="text-white text-sm">{settings.ageMax}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => update('ageMax', Math.min(100, settings.ageMax + 1))}
                    className="bg-secondary border border-glass-border rounded-xl w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text className="mb-3 text-xs font-medium text-neutral-400">Расстояние (км)</Text>
            <View className="flex-row flex-wrap gap-2">
              {DISTANCES.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => update('distanceKm', d)}
                  className={`rounded-full border px-4 py-2 ${
                    settings.distanceKm === d
                      ? 'border-accent-from bg-accent-muted'
                      : 'border-glass-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      settings.distanceKm === d ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {d} км
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="mb-3 text-xs font-medium text-neutral-400">Ищу</Text>
            <View className="flex-row gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => update('genderPref', opt.value)}
                  className={`flex-1 rounded-xl border py-3 items-center ${
                    settings.genderPref === opt.value
                      ? 'border-accent-from bg-accent-muted'
                      : 'border-glass-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      settings.genderPref === opt.value ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            className="mt-2 w-full rounded-2xl bg-accent-from py-4 items-center"
          >
            <Text className="text-base font-bold text-white">
              {saved ? 'Сохранено ✓' : 'Сохранить'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
