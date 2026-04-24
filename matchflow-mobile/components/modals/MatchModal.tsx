import { Modal, View, Text, Image, TouchableOpacity, Pressable } from 'react-native'
import { router } from 'expo-router'
import type { Match } from '@/lib/types'

interface MatchModalProps {
  match: Match | null
  onClose: () => void
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  function handleOpenChat() {
    if (!match) return
    onClose()
    router.push(`/(app)/matches/${match.id}`)
  }

  return (
    <Modal
      visible={!!match}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="w-full max-w-sm bg-card rounded-2xl p-8 items-center border border-glass-border">
            <Text className="font-bold text-3xl text-white mb-1">Это мэтч!</Text>
            <Text className="text-neutral-400 text-sm mb-8">Вы понравились друг другу</Text>

            {match ? (
              <View className="flex-row items-center gap-4 mb-8">
                <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-700">
                  <Image
                    source={{ uri: match.myPhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                <Text className="text-4xl">❤️</Text>

                <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-700">
                  <Image
                    source={{ uri: match.theirPhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
            ) : null}

            {match ? (
              <Text className="text-white text-lg font-medium mb-6">
                Ты и {match.theirName}
              </Text>
            ) : null}

            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={handleOpenChat}
                className="w-full bg-accent-from rounded-xl py-3.5 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Написать {match?.theirName}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="w-full py-3 items-center">
                <Text className="text-neutral-400 font-medium text-sm">
                  Продолжить свайпать
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
