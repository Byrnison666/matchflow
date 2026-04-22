'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { useDiscoverStore } from '@/lib/store/discover.store'
import { useInfiniteProfiles } from '@/hooks/useInfiniteProfiles'
import { swipeVariants } from '@/lib/animations'

interface SwipeDeckProps {
  onSwipe?: (direction: 'right' | 'left' | 'super') => void
}

export function SwipeDeck({ onSwipe }: SwipeDeckProps) {
  const { profiles, isLoading, hasMore } = useInfiniteProfiles()
  const recordSwipe = useDiscoverStore((s) => s.recordSwipe)

  async function handleSwipe(direction: 'right' | 'left' | 'super') {
    const topProfile = profiles[0]
    if (!topProfile) return
    onSwipe?.(direction)
    await recordSwipe(topProfile.id, direction)
  }

  if (isLoading && profiles.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-coral-gradient animate-pulse" />
      </div>
    )
  }

  if (!isLoading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
        <div className="text-6xl">🌍</div>
        <h3 className="font-display font-bold text-white text-xl">
          Все профили просмотрены
        </h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Расширь радиус поиска или вернись позже — каждый день появляются новые люди
        </p>
        {!hasMore && (
          <button className="bg-coral-gradient text-white font-semibold px-6 py-3 rounded-full text-sm">
            Расширить радиус
          </button>
        )}
      </div>
    )
  }

  const visibleProfiles = profiles.slice(0, 3)

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="popLayout">
        {[...visibleProfiles].reverse().map((profile, reversedIndex) => {
          const stackIndex = visibleProfiles.length - 1 - reversedIndex
          const isTop = stackIndex === 0

          return (
            <motion.div
              key={profile.id}
              className="absolute inset-0"
              variants={swipeVariants}
              initial="enter"
              animate="center"
              exit={isTop ? 'exitLeft' : undefined}
            >
              <SwipeCard
                profile={profile}
                onSwipe={handleSwipe}
                isTop={isTop}
                stackIndex={stackIndex}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
