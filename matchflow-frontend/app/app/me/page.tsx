'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'

const TIER_LABELS = { free: 'Free', plus: 'Plus ✨', gold: 'Gold 👑' }
const TIER_COLORS = {
  free: 'text-neutral-400',
  plus: 'text-blue-400',
  gold: 'text-yellow-400',
}

const BADGES = [
  { icon: '✅', label: 'Верификация', earned: true },
  { icon: '💬', label: 'Первый диалог', earned: true },
  { icon: '❤️', label: 'Первый мэтч', earned: true },
  { icon: '🔥', label: '7 дней подряд', earned: false },
  { icon: '⭐', label: '10 мэтчей', earned: false },
]

const STATS = [
  { label: 'Просмотры', value: '1 248' },
  { label: 'Лайки', value: '87' },
  { label: 'Мэтчи', value: '23' },
]

export default function MyProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)

  if (!user) return null

  function handleLogout() {
    logout()
    router.replace('/')
  }

  return (
    <div className="flex flex-col min-h-full pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 className="font-display font-bold text-2xl text-white">Профиль</h1>
        <button
          onClick={() => setShowLogout(true)}
          className="text-neutral-500 hover:text-white transition-colors text-sm"
        >
          Выйти
        </button>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-5 pb-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-700 border-2 border-glass-border">
            {user.photo ? (
              <Image src={user.photo} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {user.name[0]}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent-from text-white text-xs flex items-center justify-center border-2 border-primary">
            ✎
          </button>
        </div>

        <h2 className="font-display font-bold text-xl text-white">{user.name}</h2>
        <p className={`text-sm font-semibold mt-0.5 ${TIER_COLORS[user.subscriptionTier]}`}>
          {TIER_LABELS[user.subscriptionTier]}
        </p>

        {user.subscriptionTier === 'free' && (
          <Link
            href="/premium"
            className="mt-3 bg-coral-gradient text-white text-xs font-semibold px-4 py-2 rounded-full shadow-glow hover:opacity-90 transition-opacity"
          >
            Улучшить до Plus
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="mx-5 bg-card rounded-2xl border border-glass-border p-4 mb-4">
        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-3">Активность</h3>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-xl text-white">{s.value}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div className="mx-5 bg-card rounded-2xl border border-glass-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Серия входов</p>
            <p className="text-neutral-500 text-xs">Заходи каждый день за монеты</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-display font-bold text-2xl text-white">{user.streakDays}</span>
          </div>
        </div>
      </div>

      {/* Coins */}
      <div className="mx-5 bg-card rounded-2xl border border-glass-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Монеты</p>
            <p className="text-neutral-500 text-xs">Тратятся на подарки и буст</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="font-display font-bold text-xl text-yellow-400">{user.coins}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mx-5 bg-card rounded-2xl border border-glass-border p-4 mb-4">
        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-3">Достижения</h3>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                b.earned
                  ? 'bg-accent-muted border-accent-from/40 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-600'
              }`}
            >
              <span className={b.earned ? '' : 'grayscale opacity-40'}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mx-5 bg-card rounded-2xl border border-glass-border overflow-hidden">
        {[
          { label: 'Редактировать профиль', icon: '✎', href: '#' },
          { label: 'Настройки поиска', icon: '⚙️', href: '#' },
          { label: 'Уведомления', icon: '🔔', href: '#' },
          { label: 'Безопасность', icon: '🔒', href: '#' },
          { label: 'Premium', icon: '✨', href: '/premium' },
        ].map((item, i, arr) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between px-4 py-3.5 hover:bg-neutral-700/50 transition-colors ${
              i < arr.length - 1 ? 'border-b border-glass-border' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </div>
            <span className="text-neutral-600 text-xs">›</span>
          </Link>
        ))}
      </div>

      {/* Logout confirm */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70" onClick={() => setShowLogout(false)}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm bg-card rounded-2xl p-5 border border-glass-border"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-semibold text-center mb-4">Выйти из аккаунта?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 bg-neutral-700 text-white py-3 rounded-xl text-sm font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-error text-white py-3 rounded-xl text-sm font-semibold"
              >
                Выйти
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
