import { useEffect } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SwipeCard } from './SwipeCard'
import { useDiscoverStore } from '@/lib/store/discover.store'

interface SwipeDeckProps {
  onSwipe?: (direction: 'right' | 'left' | 'super') => void
}

export function SwipeDeck({ onSwipe }: SwipeDeckProps) {
  const { profiles, isLoading, hasMore, loadFeed, recordSwipe } = useDiscoverStore()

  useEffect(() => {
    if (profiles.length === 0 && hasMore) {
      loadFeed()
    }
  }, [])

  async function handleSwipe(direction: 'right' | 'left' | 'super') {
    const topProfile = profiles[0]
    if (!topProfile) return
    onSwipe?.(direction)
    await recordSwipe(topProfile.id, direction)
  }

  if (isLoading && profiles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#FF4B6E" size="large" />
      </View>
    )
  }

  if (!isLoading && profiles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-6 px-8">
        <Text className="text-6xl">🌍</Text>
        <Text className="font-bold text-white text-xl text-center">
          Все профили просмотрены
        </Text>
        <Text className="text-neutral-400 text-sm leading-relaxed text-center">
          Расширь радиус поиска или вернись позже — каждый день появляются новые люди
        </Text>
        {!hasMore && (
          <TouchableOpacity className="bg-accent-from rounded-full px-6 py-3">
            <Text className="text-white font-semibold text-sm">Расширить радиус</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const visibleProfiles = profiles.slice(0, 3)

  return (
    <View className="flex-1 relative">
      {[...visibleProfiles].reverse().map((profile, reversedIndex) => {
        const stackIndex = visibleProfiles.length - 1 - reversedIndex
        const isTop = stackIndex === 0

        return (
          <SwipeCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
            isTop={isTop}
            stackIndex={stackIndex}
          />
        )
      })}
    </View>
  )
}
