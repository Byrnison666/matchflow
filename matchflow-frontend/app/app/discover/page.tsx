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
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="font-display font-bold text-2xl text-white">
          Match<span className="text-accent-from">Flow</span>
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className="w-10 h-10 rounded-full bg-card border border-glass-border flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          ⚙️
        </button>
      </div>

      {/* Swipe area */}
      <div className="flex-1 relative px-4 pb-4 overflow-hidden">
        <SwipeDeck onSwipe={handleSwipe} />
      </div>

      {/* Action buttons */}
      {profiles.length > 0 && (
        <div className="flex items-center justify-center gap-5 px-6 pb-6">
          <ActionButton
            onClick={() => {
              const top = profiles[0]
              if (top) recordSwipe(top.id, 'left')
            }}
            icon="✕"
            size="md"
            className="bg-card border-2 border-neutral-700 text-neutral-400 hover:border-error hover:text-error"
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
            className="bg-card border-2 border-blue-500/40 text-blue-400 hover:border-blue-400"
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

      {/* Match modal */}
      <MatchModal match={matchResult} onClose={clearMatch} />

      {/* Paywall modal */}
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
