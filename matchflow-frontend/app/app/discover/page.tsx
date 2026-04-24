'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeDeck } from '@/components/cards/SwipeDeck'
import { MatchModal } from '@/components/modals/MatchModal'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { useDiscoverStore } from '@/lib/store/discover.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { PaywallReason } from '@/lib/types'

const SWIPE_LIMIT_FREE = 20

export default function DiscoverPage() {
  const user = useAuthStore((s) => s.user)
  const matchResult = useDiscoverStore((s) => s.matchResult)
  const clearMatch = useDiscoverStore((s) => s.clearMatch)
  const recordSwipe = useDiscoverStore((s) => s.recordSwipe)
  const profiles = useDiscoverStore((s) => s.profiles)

  const [swipeCount, setSwipeCount] = useState(0)
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null)
  const [showFilters, setShowFilters] = useState(false)

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

  return (
    <div className="relative flex h-screen max-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-6 top-8 h-28 rounded-full bg-accent-from/18 blur-3xl" />

      <div className="relative flex items-center justify-between px-5 pb-3 pt-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
            Discovery
          </p>
          <h1 className="font-display text-3xl font-bold leading-none text-white">
            Match<span className="text-shimmer">Flow</span>
          </h1>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-glass text-neutral-300 shadow-glass transition-colors hover:text-white"
          aria-label="Открыть фильтры"
        >
          ⚙️
        </button>
      </div>

      <div className="relative mx-5 mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-xs text-white/70 backdrop-blur-xl">
        <span>{profiles.length > 0 ? `${profiles.length} анкет рядом` : 'Ищем людей рядом'}</span>
        <span className="rounded-full bg-accent-muted px-2.5 py-1 font-bold text-accent-from">
          {Math.max(SWIPE_LIMIT_FREE - swipeCount, 0)} free likes
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden px-4 pb-4">
        <SwipeDeck onSwipe={handleSwipe} />
      </div>

      {profiles.length > 0 && (
        <div className="flex items-center justify-center gap-5 px-6 pb-7">
          <ActionButton
            onClick={() => {
              const top = profiles[0]
              if (top) recordSwipe(top.id, 'left')
            }}
            icon="✕"
            size="md"
            className="border-2 border-white/10 bg-white/[0.07] text-neutral-300 shadow-glass hover:border-error hover:text-error"
          />
          <ActionButton
            onClick={() => {
              if (user?.subscriptionTier === 'free') {
                setPaywallReason(PaywallReason.SUPER_LIKE)
              } else {
                const top = profiles[0]
                if (top) recordSwipe(top.id, 'super')
              }
            }}
            icon="⭐"
            size="sm"
            className="border-2 border-sky-400/30 bg-sky-400/10 text-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.18)] hover:border-sky-300"
          />
          <ActionButton
            onClick={() => {
              const top = profiles[0]
              if (top) recordSwipe(top.id, 'right')
            }}
            icon="♥"
            size="lg"
            className="bg-coral-gradient text-white shadow-glow"
          />
        </div>
      )}

      <MatchModal match={matchResult} onClose={clearMatch} />

      <AnimatePresence>
        {paywallReason && (
          <PaywallModal
            reason={paywallReason}
            onClose={() => setPaywallReason(null)}
            onUpgrade={() => {
              setPaywallReason(null)
              window.location.href = '/premium'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionButton({
  onClick,
  icon,
  size,
  className,
}: {
  onClick: () => void
  icon: string
  size: 'sm' | 'md' | 'lg'
  className: string
}) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl' : size === 'md' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-base'
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClass} ${className} rounded-full flex items-center justify-center font-bold transition-colors`}
    >
      {icon}
    </motion.button>
  )
}
