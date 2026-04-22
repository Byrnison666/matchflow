'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { paywallSlideUp } from '@/lib/animations'
import { PaywallReason, type SubscriptionTier } from '@/lib/types'

const PAYWALL_CONTENT: Record<
  PaywallReason,
  { icon: string; title: string; description: string; requiredTier: SubscriptionTier }
> = {
  [PaywallReason.SWIPE_LIMIT]: {
    icon: '❤️',
    title: 'Лайки закончились',
    description: 'В Plus — безлимитные лайки, отмена последнего свайпа и просмотр тех, кто тебя лайкнул.',
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
    description: 'Выдели себя — человек увидит, что ты поставил супер-лайк ещё до свайпа. 5 в день с Gold.',
    requiredTier: 'gold',
  },
  [PaywallReason.ICEBREAKER]: {
    icon: '✨',
    title: 'AI-ледокол',
    description: 'Персональные фразы для знакомства, сгенерированные под конкретный профиль. С Plus.',
    requiredTier: 'plus',
  },
  [PaywallReason.PASSPORT]: {
    icon: '🌍',
    title: 'Паспорт — смени локацию',
    description: 'Ищи людей в любой точке мира без физического переезда. Только Gold.',
    requiredTier: 'gold',
  },
}

const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: 'Free',
  plus: 'Plus',
  gold: 'Gold',
}

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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          className="relative z-10 w-full max-w-lg"
          variants={paywallSlideUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-secondary rounded-t-2xl px-6 pt-6 pb-10 border-t border-glass-border shadow-modal">
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 bg-neutral-600 rounded-full" />
            </div>

            <div className="text-5xl text-center mb-4">{content.icon}</div>
            <h2 className="font-display font-bold text-white text-2xl text-center mb-3">
              {content.title}
            </h2>
            <p className="text-neutral-400 text-sm text-center leading-relaxed mb-8">
              {content.description}
            </p>

            <div className="bg-card rounded-xl p-4 mb-6 border border-glass-border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold text-base">
                    Matchflow {TIER_LABEL[content.requiredTier]}
                  </p>
                  <p className="text-neutral-400 text-xs mt-0.5">Отменить можно в любой момент</p>
                </div>
                <p className="text-accent-from font-bold text-lg">
                  {TIER_PRICE[content.requiredTier]}
                </p>
              </div>
            </div>

            <button
              onClick={() => onUpgrade(content.requiredTier)}
              className="w-full bg-coral-gradient text-white font-semibold py-4 rounded-xl text-base mb-3 shadow-glow"
            >
              Попробовать {TIER_LABEL[content.requiredTier]}
            </button>
            <button
              onClick={onClose}
              className="w-full text-neutral-500 font-medium py-3 text-sm"
            >
              Не сейчас
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
