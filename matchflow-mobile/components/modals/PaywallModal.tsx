import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native'
import { PaywallReason, type SubscriptionTier } from '@/lib/types'

const PAYWALL_CONTENT: Record<
  PaywallReason,
  { icon: string; title: string; description: string; requiredTier: SubscriptionTier }
> = {
  [PaywallReason.SWIPE_LIMIT]: {
    icon: '❤️',
    title: 'Лайки закончились',
    description:
      'В Plus — безлимитные лайки, отмена последнего свайпа и просмотр тех, кто тебя лайкнул.',
    requiredTier: 'plus',
  },
  [PaywallReason.WHO_LIKED_ME]: {
    icon: '👀',
    title: 'Узнай кто тебя лайкнул',
    description: 'С Plus ты видишь всех, кто уже поставил тебе лайк. Начни разговор первым.',
    requiredTier: 'plus',
  },
  [PaywallReason.REWIND]: {
    icon: '↩️',
    title: 'Вернуть последний свайп',
    description: 'Случайно пропустил кого-то интересного? С Plus можно вернуть последний свайп.',
    requiredTier: 'plus',
  },
  [PaywallReason.INCOGNITO]: {
    icon: '🕶️',
    title: 'Режим инкогнито',
    description: 'Тебя видят только те, кому ты уже поставил лайк. Доступно в Gold.',
    requiredTier: 'gold',
  },
  [PaywallReason.SUPER_LIKE]: {
    icon: '⭐',
    title: 'Супер-лайки',
    description:
      'Выдели себя — человек увидит, что ты поставил супер-лайк ещё до свайпа. 5 в день с Gold.',
    requiredTier: 'gold',
  },
  [PaywallReason.ICEBREAKER]: {
    icon: '✨',
    title: 'AI-ледокол',
    description:
      'Персональные фразы для знакомства, сгенерированные под конкретный профиль. С Plus.',
    requiredTier: 'plus',
  },
  [PaywallReason.PASSPORT]: {
    icon: '🌍',
    title: 'Паспорт — смени локацию',
    description: 'Ищи людей в любой точке мира без физического переезда. Только Gold.',
    requiredTier: 'gold',
  },
}

const TIER_LABEL: Record<SubscriptionTier, string> = { free: 'Free', plus: 'Plus', gold: 'Gold' }
const TIER_PRICE: Record<SubscriptionTier, string> = {
  free: 'Бесплатно',
  plus: '699 ₽/мес',
  gold: '1 299 ₽/мес',
}

interface PaywallModalProps {
  reason: PaywallReason
  onClose: () => void
  onUpgrade: (tier: SubscriptionTier) => void
}

export function PaywallModal({ reason, onClose, onUpgrade }: PaywallModalProps) {
  const content = PAYWALL_CONTENT[reason]

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="w-full bg-secondary rounded-t-2xl px-6 pt-6 pb-10 border-t border-glass-border"
          >
            <View className="items-center mb-6">
              <View className="w-10 h-1 bg-neutral-600 rounded-full" />
            </View>

            <Text className="text-5xl text-center mb-4">{content.icon}</Text>
            <Text className="font-bold text-white text-2xl text-center mb-3">
              {content.title}
            </Text>
            <Text className="text-neutral-400 text-sm text-center leading-relaxed mb-8">
              {content.description}
            </Text>

            <View className="bg-card rounded-xl p-4 mb-6 border border-glass-border">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-semibold text-base">
                    Matchflow {TIER_LABEL[content.requiredTier]}
                  </Text>
                  <Text className="text-neutral-400 text-xs mt-0.5">
                    Отменить можно в любой момент
                  </Text>
                </View>
                <Text className="text-accent-from font-bold text-lg">
                  {TIER_PRICE[content.requiredTier]}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onUpgrade(content.requiredTier)}
              className="w-full bg-accent-from rounded-xl py-4 items-center mb-3"
            >
              <Text className="text-white font-semibold text-base">
                Попробовать {TIER_LABEL[content.requiredTier]}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="w-full py-3 items-center">
              <Text className="text-neutral-500 font-medium text-sm">Не сейчас</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
