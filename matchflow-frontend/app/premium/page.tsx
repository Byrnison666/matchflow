'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { SubscriptionTier } from '@/lib/types'

const PLANS = [
  {
    tier: 'free' as SubscriptionTier,
    name: 'Free',
    price: '0',
    period: 'навсегда',
    color: 'border-neutral-600',
    badge: '',
    features: [
      '20 лайков в день',
      'Базовый чат',
      'Стандартный поиск',
      'Реклама',
    ],
    disabled: ['Кто лайкнул', 'Безлимитные лайки', 'Инкогнито', 'Буст', 'Суперлайки'],
  },
  {
    tier: 'plus' as SubscriptionTier,
    name: 'Plus',
    price: '699',
    period: '/мес',
    color: 'border-blue-500',
    badge: 'Популярное',
    features: [
      'Безлимитные лайки',
      'Кто меня лайкнул',
      'Отмена последнего свайпа',
      'Расширенные фильтры',
      'AI-ледокол',
      'Без рекламы',
    ],
    disabled: ['Инкогнито', '5 суперлайков/день', 'Еженедельный буст'],
  },
  {
    tier: 'gold' as SubscriptionTier,
    name: 'Gold',
    price: '1 299',
    period: '/мес',
    color: 'border-yellow-400',
    badge: 'Максимум',
    features: [
      'Всё из Plus',
      'Режим инкогнито',
      '5 суперлайков в день',
      'Еженедельный буст профиля',
      'Read receipts',
      'AI-совместимость (0–100%)',
      'Виртуальные подарки',
    ],
    disabled: [],
  },
]

const ONE_TIME = [
  { id: 'boost', icon: '⚡', name: 'Буст профиля', desc: 'Топ показов на 30 мин', price: '149 ₽' },
  { id: 'superlike_5', icon: '⭐', name: '5 Суперлайков', desc: 'Выдели себя', price: '249 ₽' },
  { id: 'gift_pack', icon: '🎁', name: 'Пак подарков', desc: '20 монет', price: '199 ₽' },
]

export default function PremiumPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateTier = useAuthStore((s) => s.updateTier)
  const [selected, setSelected] = useState<SubscriptionTier>('plus')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubscribe() {
    if (!user || selected === 'free') return
    setIsLoading(true)
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/subscribe', {
        tier: selected,
      })
      window.location.href = data.checkoutUrl
    } catch {
      setIsLoading(false)
    }
  }

  async function handleOneTime(productId: string) {
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/purchase', {
        productId,
      })
      window.location.href = data.checkoutUrl
    } catch {}
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-neutral-400 hover:text-white transition-colors">
            ←
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Premium</h1>
            <p className="text-neutral-400 text-xs">Разблокируй все возможности</p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="flex flex-col gap-4 mb-8">
          {PLANS.map((plan, i) => (
            <motion.button
              key={plan.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(plan.tier)}
              className={`relative text-left bg-card rounded-2xl p-5 border-2 transition-all ${
                selected === plan.tier ? plan.color : 'border-transparent'
              }`}
            >
              {plan.badge && (
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  plan.tier === 'gold' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {plan.badge}
                </span>
              )}

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display font-bold text-3xl text-white">{plan.price}</span>
                {plan.price !== '0' && <span className="text-neutral-400 text-sm">₽</span>}
                <span className="text-neutral-500 text-sm">{plan.period}</span>
              </div>

              <p className="font-display font-bold text-lg text-white mb-3">{plan.name}</p>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="text-success text-xs">✓</span> {f}
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
                    <span className="text-xs">✕</span> {f}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        {selected !== 'free' && (
          <motion.button
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-coral-gradient text-white font-bold py-4 rounded-2xl text-base shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60 mb-4"
          >
            {isLoading ? 'Переход к оплате...' : `Подключить ${selected === 'gold' ? 'Gold' : 'Plus'}`}
          </motion.button>
        )}

        <p className="text-neutral-600 text-xs text-center mb-8">
          Отменить подписку можно в любой момент. Без скрытых списаний.
        </p>

        {/* One-time purchases */}
        <h2 className="font-display font-bold text-lg text-white mb-4">Разовые покупки</h2>
        <div className="flex flex-col gap-3">
          {ONE_TIME.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-card rounded-xl px-4 py-3.5 border border-glass-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{item.name}</p>
                  <p className="text-neutral-500 text-xs">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleOneTime(item.id)}
                className="bg-coral-gradient text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-glow"
              >
                {item.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
