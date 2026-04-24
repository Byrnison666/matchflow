'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { User } from '@/lib/types'

const TIER_LABELS = { free: 'Free', plus: 'Plus ✨', gold: 'Gold 👑' }
const TIER_COLORS = {
  free: 'text-neutral-400',
  plus: 'text-blue-400',
  gold: 'text-yellow-400',
}

interface Stats {
  views: number
  likes: number
  matches: number
}

function deriveBadges(user: User, stats: Stats | null) {
  return [
    { icon: '✅', label: 'Верификация', earned: user.isVerified },
    { icon: '💬', label: 'Первый диалог', earned: (stats?.matches ?? 0) >= 1 },
    { icon: '❤️', label: 'Первый мэтч', earned: (stats?.matches ?? 0) >= 1 },
    { icon: '🔥', label: '7 дней подряд', earned: user.streakDays >= 7 },
    { icon: '⭐', label: '10 мэтчей', earned: (stats?.matches ?? 0) >= 10 },
  ]
}

export default function MyProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  const [showLogout, setShowLogout] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiClient.get<Stats>('/users/me/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  if (!user) return null

  function handleLogout() {
    logout()
    router.replace('/')
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('photo', file)
      const { data } = await apiClient.post<{ photo: string }>('/users/me/photos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setUser({ ...user!, photo: data.photo })
    } catch {
      // silently ignore — photo stays unchanged
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const badges = deriveBadges(user, stats)
  const displayStats = [
    { label: 'Просмотры', value: stats ? String(stats.views) : '—' },
    { label: 'Лайки', value: stats ? String(stats.likes) : '—' },
    { label: 'Мэтчи', value: stats ? String(stats.matches) : '—' },
  ]

  return (
    <div className="relative flex min-h-full flex-col pb-6">
      <div className="pointer-events-none absolute inset-x-8 top-8 h-40 rounded-full bg-accent-from/[0.16] blur-3xl" />

      <div className="relative flex items-center justify-between px-5 pb-4 pt-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
            Control room
          </p>
          <h1 className="font-display text-3xl font-bold text-white">Профиль</h1>
        </div>
        <button
          onClick={() => setShowLogout(true)}
          className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          Выйти
        </button>
      </div>

      <div className="relative mx-5 mb-4 overflow-hidden rounded-[32px] border border-white/10 bg-aurora-panel p-5 shadow-premium backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-from/[0.28] blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-orange-300/[0.16] blur-3xl" />

        <div className="relative flex flex-col items-center">
          <div className="relative mb-4">
            {user.isVerified && (
              <div className="absolute -inset-2 rounded-full bg-coral-gradient opacity-70 blur-md" />
            )}
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-neutral-700 shadow-[0_16px_36px_rgba(0,0,0,0.42)]">
              {user.photo ? (
                <Image src={user.photo} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  {user.name[0]}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
                  ...
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-accent-from text-xs text-white shadow-glow disabled:opacity-60"
            >
              ✎
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-white">{user.name}</h2>
          <p className={`mt-0.5 text-sm font-bold ${TIER_COLORS[user.subscriptionTier]}`}>
            {TIER_LABELS[user.subscriptionTier]}
          </p>

          {user.subscriptionTier === 'free' && (
            <Link
              href="/premium"
              className="mt-3 rounded-full bg-coral-gradient px-4 py-2 text-xs font-bold text-white shadow-glow transition-opacity hover:opacity-90"
            >
              Улучшить до Plus
            </Link>
          )}
        </div>
      </div>

      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-[26px] border border-white/10 bg-card/80 p-4 shadow-glass backdrop-blur-xl">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Активность</h3>
          <div className="grid grid-cols-3 gap-2">
            {displayStats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.045] p-3 text-center">
                <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-card/80 p-4 shadow-glass backdrop-blur-xl">
          <div className="mb-4 h-12 w-12 rounded-2xl flame-core" />
          <div>
            <p className="text-sm font-semibold text-white">Серия</p>
            <p className="text-xs text-neutral-500">Дней подряд</p>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-white">{user.streakDays}</p>
        </div>

        <div className="rounded-[26px] border border-yellow-300/[0.14] bg-gradient-to-br from-yellow-300/[0.14] to-white/[0.045] p-4 shadow-glass backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300/[0.14] text-2xl shadow-[0_0_24px_rgba(250,204,21,0.18)]">
            🪙
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Монеты</p>
            <p className="text-xs text-neutral-500">Подарки и буст</p>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-yellow-300">{user.coins}</p>
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-[26px] border border-white/10 bg-card/80 p-4 shadow-glass backdrop-blur-xl">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Достижения</h3>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <div
              key={b.label}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                b.earned
                  ? 'border-accent-from/40 bg-accent-muted text-white shadow-[0_0_18px_rgba(255,75,110,0.12)]'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-600'
              }`}
            >
              <span className={b.earned ? '' : 'opacity-40 grayscale'}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 overflow-hidden rounded-[26px] border border-white/10 bg-card/80 shadow-glass backdrop-blur-xl">
        {[
          { label: 'Редактировать профиль', icon: '✎', href: '/app/me/edit' },
          { label: 'Настройки поиска', icon: '⚙️', href: '/app/me/search' },
          { label: 'Уведомления', icon: '🔔', href: '/app/me/notifications' },
          { label: 'Безопасность', icon: '🔒', href: '/app/me/security' },
          { label: 'Premium', icon: '✨', href: '/premium' },
        ].map((item, i, arr) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-neutral-700/50 ${
              i < arr.length - 1 ? 'border-b border-glass-border' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-lg">{item.icon}</span>
              <span className="text-sm text-white">{item.label}</span>
            </div>
            <span className="text-xs text-neutral-600">›</span>
          </Link>
        ))}
      </div>

      {showLogout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4"
          onClick={() => setShowLogout(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl border border-glass-border bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center font-semibold text-white">Выйти из аккаунта?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 rounded-xl bg-neutral-700 py-3 text-sm font-medium text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-error py-3 text-sm font-semibold text-white"
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
