'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeDeck } from '@/components/cards/SwipeDeck'
import { MatchModal } from '@/components/modals/MatchModal'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { useDiscoverStore } from '@/lib/store/discover.store'
import { useAuthStore } from '@/lib/store/auth.store'
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

export default function DiscoverPage() {
  const user = useAuthStore((s) => s.user)
  const matchResult = useDiscoverStore((s) => s.matchResult)
  const clearMatch = useDiscoverStore((s) => s.clearMatch)
  const recordSwipe = useDiscoverStore((s) => s.recordSwipe)
  const profiles = useDiscoverStore((s) => s.profiles)

  const [swipeCount, setSwipeCount] = useState(0)
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(FILTER_DEFAULTS)
  const [draftFilters, setDraftFilters] = useState<Filters>(FILTER_DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Filters
        setFilters(saved)
        setDraftFilters(saved)
      }
    } catch {}
  }, [])

  function openFilters() {
    setDraftFilters(filters)
    setShowFilters(true)
  }

  function applyFilters() {
    setFilters(draftFilters)
    localStorage.setItem(FILTERS_KEY, JSON.stringify(draftFilters))
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
          onClick={openFilters}
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

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-card p-6 shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">Фильтры поиска</h2>
                <button onClick={() => setShowFilters(false)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-400">Возраст</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={18}
                      max={draftFilters.ageMax - 1}
                      value={draftFilters.ageMin}
                      onChange={(e) => updateDraft('ageMin', Number(e.target.value))}
                      className="w-full rounded-xl border border-glass-border bg-secondary px-3 py-2.5 text-sm text-white focus:border-accent-from focus:outline-none"
                    />
                    <span className="text-neutral-600">—</span>
                    <input
                      type="number"
                      min={draftFilters.ageMin + 1}
                      max={100}
                      value={draftFilters.ageMax}
                      onChange={(e) => updateDraft('ageMax', Number(e.target.value))}
                      className="w-full rounded-xl border border-glass-border bg-secondary px-3 py-2.5 text-sm text-white focus:border-accent-from focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-400">Расстояние</p>
                  <div className="flex flex-wrap gap-2">
                    {DISTANCES.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateDraft('distanceKm', d)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          draftFilters.distanceKm === d
                            ? 'border-accent-from bg-accent-muted text-white'
                            : 'border-glass-border bg-secondary text-neutral-400'
                        }`}
                      >
                        {d} км
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-400">Ищу</p>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateDraft('genderPref', opt.value)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                          draftFilters.genderPref === opt.value
                            ? 'border-accent-from bg-accent-muted text-white'
                            : 'border-glass-border bg-secondary text-neutral-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="mt-1 w-full rounded-2xl bg-coral-gradient py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-90 transition-opacity"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </motion.div>
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
