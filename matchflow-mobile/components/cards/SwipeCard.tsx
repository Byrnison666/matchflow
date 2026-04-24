import { useState } from 'react'
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import type { Profile } from '@/lib/types'

const SWIPE_THRESHOLD = 120
const SCREEN_WIDTH = Dimensions.get('window').width

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'right' | 'left' | 'super') => void
  isTop: boolean
  stackIndex: number
}

export function SwipeCard({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const mainPhoto = profile.photos[photoIndex] ?? profile.photos[0]

  const scaleForStack = 1 - stackIndex * 0.04
  const yOffsetForStack = stackIndex * 12

  function triggerSwipe(direction: 'right' | 'left' | 'super') {
    onSwipe(direction)
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX
      translateY.value = e.translationY
    })
    .onEnd((e) => {
      const isSwipeUp = e.translationY < -SWIPE_THRESHOLD && Math.abs(e.translationX) < 60
      const isSwipeRight = e.translationX > SWIPE_THRESHOLD
      const isSwipeLeft = e.translationX < -SWIPE_THRESHOLD

      if (isSwipeUp) {
        runOnJS(triggerSwipe)('super')
      } else if (isSwipeRight) {
        runOnJS(triggerSwipe)('right')
      } else if (isSwipeLeft) {
        runOnJS(triggerSwipe)('left')
      } else {
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    })

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-300, 0, 300], [-18, 0, 18])
    const opacity = interpolate(
      translateX.value,
      [-300, -150, 0, 150, 300],
      [0.5, 0.9, 1, 0.9, 0.5],
    )
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    }
  })

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, 120], [0, 1], 'clamp'),
  }))

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-120, -20], [1, 0], 'clamp'),
  }))

  const superOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-120, -20], [1, 0], 'clamp'),
  }))

  if (!isTop) {
    const stackPhoto = profile.photos[0]
    return (
      <View
        className="absolute inset-0 overflow-hidden rounded-[28px] border border-glass-border bg-card"
        style={{
          transform: [{ scale: scaleForStack }, { translateY: yOffsetForStack }],
          zIndex: 10 - stackIndex,
        }}
      >
        {stackPhoto ? (
          <Image
            source={{ uri: stackPhoto.url }}
            className="w-full h-full"
            resizeMode="cover"
            style={{ opacity: 0.45 }}
          />
        ) : (
          <View className="w-full h-full bg-card" />
        )}
        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
      </View>
    )
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="absolute inset-0 overflow-hidden rounded-[28px] border border-glass-border"
        style={[cardStyle, { zIndex: 20 }]}
      >
        <View className="relative w-full h-full">
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto.url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-card" />
          )}

          <View
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
              backgroundColor: 'transparent',
            }}
          />
          <View
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background: undefined,
              backgroundColor: 'transparent',
              shadowColor: '#000',
            }}
          />
          <View
            className="absolute inset-x-0 bottom-0 h-64"
            style={{ backgroundColor: 'rgba(0,0,0,0)' }}
          />

          {/* Gradient overlay via absolute positioned view */}
          <View
            className="absolute inset-0"
            pointerEvents="none"
            style={{
              backgroundColor: 'transparent',
            }}
          />
          <View
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 280, backgroundColor: 'rgba(0,0,0,0)', overflow: 'hidden' }}
            pointerEvents="none"
          >
            <View
              className="absolute bottom-0 left-0 right-0 top-0"
              style={{
                background: 'linear-gradient(to top, rgba(8,8,10,0.95), transparent)',
                backgroundColor: 'rgba(8,8,10,0.6)',
                opacity: 0.9,
              }}
            />
          </View>

          {/* Photo dots */}
          <View className="absolute left-0 right-0 top-4 flex-row justify-center gap-1 px-4">
            {profile.photos.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPhotoIndex(i)}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor: i === photoIndex ? '#ffffff' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </View>

          {/* ЛАЙК overlay */}
          <Animated.View
            className="absolute left-6 top-8 rounded-2xl px-4 py-1.5"
            style={[
              likeOpacity,
              {
                borderWidth: 4,
                borderColor: '#6ee7b7',
                backgroundColor: 'rgba(52,211,153,0.1)',
                transform: [{ rotate: '-15deg' }],
              },
            ]}
          >
            <Text className="text-2xl font-extrabold tracking-widest text-green-300">ЛАЙК</Text>
          </Animated.View>

          {/* НЕЕЕТ overlay */}
          <Animated.View
            className="absolute right-6 top-8 rounded-2xl px-4 py-1.5"
            style={[
              nopeOpacity,
              {
                borderWidth: 4,
                borderColor: '#fca5a5',
                backgroundColor: 'rgba(251,113,133,0.1)',
                transform: [{ rotate: '15deg' }],
              },
            ]}
          >
            <Text className="text-2xl font-extrabold tracking-widest text-red-300">НЕЕЕТ</Text>
          </Animated.View>

          {/* СУПЕР overlay */}
          <Animated.View
            className="absolute top-8 rounded-2xl px-4 py-1.5"
            style={[
              superOpacity,
              {
                left: SCREEN_WIDTH / 2 - 60,
                borderWidth: 4,
                borderColor: '#7dd3fc',
                backgroundColor: 'rgba(56,189,248,0.1)',
              },
            ]}
          >
            <Text className="text-2xl font-extrabold tracking-widest text-sky-300">СУПЕР</Text>
          </Animated.View>

          {/* Profile info */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <View className="flex-row items-end gap-2 mb-1">
              <Text className="text-3xl font-bold text-white" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
                {profile.name}, {profile.age}
              </Text>
              {profile.isVerified && (
                <Text className="mb-1 text-sky-300 text-xl">✓</Text>
              )}
              {profile.isOnline && (
                <View
                  className="mb-1.5 rounded-full border px-2 py-0.5"
                  style={{ borderColor: 'rgba(167,243,208,0.3)', backgroundColor: 'rgba(52,211,153,0.15)' }}
                >
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-green-200">
                    online
                  </Text>
                </View>
              )}
            </View>

            {profile.distanceKm < 1000 && (
              <Text className="mb-2 text-sm font-medium text-white/70">
                {profile.distanceKm} км от тебя
              </Text>
            )}

            {profile.interests.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {profile.interests.slice(0, 4).map((interest) => (
                  <View
                    key={interest}
                    className="rounded-full border px-2.5 py-1"
                    style={{
                      borderColor: 'rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text className="text-xs font-semibold text-white">{interest}</Text>
                  </View>
                ))}
              </View>
            )}

            {profile.bio ? (
              <View
                className="mb-3 rounded-2xl border p-3"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  backgroundColor: 'rgba(255,255,255,0.075)',
                }}
              >
                <Text
                  className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  Prompt
                </Text>
                <Text className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {profile.bio}
                </Text>
              </View>
            ) : null}

            {profile.aiIcebreaker ? (
              <View
                className="relative overflow-hidden rounded-2xl border p-3"
                style={{
                  borderColor: 'rgba(255,75,110,0.25)',
                  backgroundColor: 'rgba(255,75,110,0.15)',
                }}
              >
                <Text className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.84)' }}>
                  <Text className="font-semibold text-accent-from">AI </Text>
                  {profile.aiIcebreaker}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
