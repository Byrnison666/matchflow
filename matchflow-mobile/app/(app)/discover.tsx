import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useDiscoverStore } from '@/lib/store/discover.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { SwipeDeck } from '@/components/cards/SwipeDeck'
import { MatchModal } from '@/components/modals/MatchModal'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { PaywallReason } from '@/lib/types'

const SWIPE_LIMIT_FREE = 20
const FILTERS_KEY = 'matchflow:search_settings'

interface Filters {
  ageMin: number
  ageMax: number
  distanceKm: number
  genderPref: 'all' | 'women' | 'men'
}

const FILTER_DEFAULTS: Filters = { ageMin: 18, ageMax: 45, distanceKm: 25, genderPref: 'all' }
const DISTANCES = [5, 10, 25, 50, 100]
const GENDER_OPTIONS: Array<{ value: Filters['genderPref']; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'women', label: 'Женщины' },
  { value: 'men', label: 'Мужчины' },
]

export default function DiscoverScreen() {
  const user = useAuthStore((s) => s.user)
  const matchResult = useDiscoverStore((s) => s.matchResult)
  const clearMatch = useDiscoverStore((s) => s.clearMatch)
  const recordSwipe = useDiscoverStore((s) => s.recordSwipe)
  const profiles = useDiscoverStore((s) => s.profiles)
  const loadFeed = useDiscoverStore((s) => s.loadFeed)

  const [swipeCount, setSwipeCount] = useState(0)
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(FILTER_DEFAULTS)
  const [draftFilters, setDraftFilters] = useState<Filters>(FILTER_DEFAULTS)

  useEffect(() => {
    AsyncStorage.getItem(FILTERS_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Filters
          setFilters(saved)
          setDraftFilters(saved)
        } catch {}
      }
    })
    loadFeed()
  }, [])

  function openFilters() {
    setDraftFilters(filters)
    setShowFilters(true)
  }

  async function applyFilters() {
    setFilters(draftFilters)
    await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(draftFilters))
    setShowFilters(false)
  }

  function updateDraft<K extends keyof Filters>(key: K, value: Filters[K]) {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleSwipe(direction: 'right' | 'left' | 'super') {
    if (user?.subscriptionTier === 'free' && swipeCount >= SWIPE_LIMIT_FREE) {
      setPaywallReason(PaywallReason.SWIPE_LIMIT)
      return
    }
    if (direction === 'super' && user?.subscriptionTier === 'free') {
      setPaywallReason(PaywallReason.SUPER_LIKE)
      return
    }
    setSwipeCount((c) => c + 1)
  }

  const freeLikesLeft = Math.max(SWIPE_LIMIT_FREE - swipeCount, 0)

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center justify-between px-5 pb-3 pt-3">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            Discovery
          </Text>
          <Text className="text-3xl font-bold text-white leading-none">
            Match<Text className="text-accent-from">Flow</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={openFilters}
          className="w-11 h-11 items-center justify-center rounded-full border border-glass-border bg-white/5"
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View className="mx-5 mb-3 flex-row items-center justify-between rounded-2xl border border-glass-border bg-white/5 px-3.5 py-2.5">
        <Text className="text-xs text-white/70">
          {profiles.length > 0 ? `${profiles.length} анкет рядом` : 'Ищем людей рядом'}
        </Text>
        <View className="rounded-full bg-accent-muted px-2.5 py-1">
          <Text className="text-xs font-bold text-accent-from">{freeLikesLeft} free likes</Text>
        </View>
      </View>

      <View className="flex-1 mx-4 mb-2">
        <SwipeDeck onSwipe={handleSwipe} />
      </View>

      {profiles.length > 0 && (
        <View className="flex-row items-center justify-center gap-5 px-6 pb-6">
          <TouchableOpacity
            onPress={() => {
              const top = profiles[0]
              if (top) recordSwipe(top.id, 'left')
            }}
            className="w-12 h-12 items-center justify-center rounded-full border-2 border-glass-border bg-white/7"
          >
            <Text className="text-neutral-300 text-lg font-bold">✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (user?.subscriptionTier === 'free') {
                setPaywallReason(PaywallReason.SUPER_LIKE)
              } else {
                const top = profiles[0]
                if (top) recordSwipe(top.id, 'super')
              }
            }}
            className="w-10 h-10 items-center justify-center rounded-full border-2 bg-sky-400/10"
            style={{ borderColor: 'rgba(56,189,248,0.3)' }}
          >
            <Text style={{ fontSize: 18 }}>⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const top = profiles[0]
              if (top) recordSwipe(top.id, 'right')
            }}
            className="w-16 h-16 items-center justify-center rounded-full bg-accent-from"
          >
            <Text className="text-white text-2xl font-bold">♥</Text>
          </TouchableOpacity>
        </View>
      )}

      <MatchModal match={matchResult} onClose={clearMatch} />

      {paywallReason && (
        <PaywallModal
          reason={paywallReason}
          onClose={() => setPaywallReason(null)}
          onUpgrade={() => {
            setPaywallReason(null)
            router.push('/premium')
          }}
        />
      )}

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-end"
          onPress={() => setShowFilters(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-[28px] border-t border-glass-border bg-card p-6">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-xl font-bold text-white">Фильтры поиска</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text className="text-neutral-500 text-base">✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-5">
                  <View>
                    <Text className="mb-2 text-xs font-medium text-neutral-400">Возраст</Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1">
                        <Text className="text-neutral-400 text-xs mb-1">От</Text>
                        <TouchableOpacity
                          className="bg-secondary border border-glass-border rounded-xl px-3 py-2.5 items-center"
                          onPress={() =>
                            updateDraft(
                              'ageMin',
                              Math.max(18, Math.min(draftFilters.ageMin - 1, draftFilters.ageMax - 1)),
                            )
                          }
                        >
                          <Text className="text-white text-sm">{draftFilters.ageMin}</Text>
                        </TouchableOpacity>
                        <View className="flex-row justify-between mt-1">
                          <TouchableOpacity
                            onPress={() =>
                              updateDraft('ageMin', Math.max(18, draftFilters.ageMin - 1))
                            }
                            className="bg-secondary px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              updateDraft(
                                'ageMin',
                                Math.min(draftFilters.ageMax - 1, draftFilters.ageMin + 1),
                              )
                            }
                            className="bg-secondary px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text className="text-neutral-600">—</Text>
                      <View className="flex-1">
                        <Text className="text-neutral-400 text-xs mb-1">До</Text>
                        <TouchableOpacity className="bg-secondary border border-glass-border rounded-xl px-3 py-2.5 items-center">
                          <Text className="text-white text-sm">{draftFilters.ageMax}</Text>
                        </TouchableOpacity>
                        <View className="flex-row justify-between mt-1">
                          <TouchableOpacity
                            onPress={() =>
                              updateDraft(
                                'ageMax',
                                Math.max(draftFilters.ageMin + 1, draftFilters.ageMax - 1),
                              )
                            }
                            className="bg-secondary px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              updateDraft('ageMax', Math.min(100, draftFilters.ageMax + 1))
                            }
                            className="bg-secondary px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="mb-2 text-xs font-medium text-neutral-400">Расстояние</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {DISTANCES.map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => updateDraft('distanceKm', d)}
                          className={`rounded-full border px-3 py-1.5 ${
                            draftFilters.distanceKm === d
                              ? 'border-accent-from bg-accent-muted'
                              : 'border-glass-border bg-secondary'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              draftFilters.distanceKm === d ? 'text-white' : 'text-neutral-400'
                            }`}
                          >
                            {d} км
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="mb-2 text-xs font-medium text-neutral-400">Ищу</Text>
                    <View className="flex-row gap-2">
                      {GENDER_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => updateDraft('genderPref', opt.value)}
                          className={`flex-1 rounded-xl border py-2.5 items-center ${
                            draftFilters.genderPref === opt.value
                              ? 'border-accent-from bg-accent-muted'
                              : 'border-glass-border bg-secondary'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              draftFilters.genderPref === opt.value ? 'text-white' : 'text-neutral-400'
                            }`}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={applyFilters}
                    className="mt-1 w-full rounded-2xl bg-accent-from py-3.5 items-center"
                  >
                    <Text className="text-sm font-bold text-white">Применить</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
