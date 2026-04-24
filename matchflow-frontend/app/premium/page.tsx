'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
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
    features: ['20 лайков в день', 'Базовый чат', 'Стандартный поиск', 'Реклама'],
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

type BtnState = 'idle' | 'loading' | 'error'

export default function PremiumPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [selected, setSelected] = useState<SubscriptionTier>('plus')
  const [subscribeState, setSubscribeState] = useState<BtnState>('idle')
  const [purchaseStates, setPurchaseStates] = useState<Record<string, BtnState>>({})
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubscribe() {
    if (!user || selected === 'free') return
    setSubscribeState('loading')
    setErrorMsg('')
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/subscribe', { tier: selected })
      window.location.href = data.checkoutUrl
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Ошибка оплаты')
        : 'Ошибка оплаты'
      setErrorMsg(msg)
      setSubscribeState('error')
      setTimeout(() => setSubscribeState('idle'), 4000)
    }
  }

  async function handleOneTime(productId: string) {
    setPurchaseStates((s) => ({ ...s, [productId]: 'loading' }))
    setErrorMsg('')
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/purchase', { productId })
      window.location.href = data.checkoutUrl
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Ошибка оплаты')
        : 'Ошибка оплаты'
      setErrorMsg(msg)
      setPurchaseStates((s) => ({ ...s, [productId]: 'error' }))
      setTimeout(() => setPurchaseStates((s) => ({ ...s, [productId]: 'idle' })), 4000)
    }
  }

  const subscribeLabel = {
    idle: `Подключить ${selected === 'gold' ? 'Gold' : 'Plus'}`,
    loading: 'Переходим к оплате...',
    error: 'Попробуй ещё раз',
  }[subscribeState]

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-lg px-5 pb-20 pt-12">
        <div className="mb-8 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-neutral-400 hover:text-white transition-colors">
            ←
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Premium</h1>
            <p className="text-xs text-neutral-400">Разблокируй все возможности</p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          {PLANS.map((plan, i) => (
            <motion.button
              key={plan.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(plan.tier)}
              className={`relative bg-card rounded-2xl p-5 border-2 text-left transition-all ${
                selected === plan.tier ? plan.color : 'border-transparent'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    plan.tier === 'gold'
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-white">{plan.price}</span>
                {plan.price !== '0' && <span className="text-sm text-neutral-400">₽</span>}
                <span className="text-sm text-neutral-500">{plan.period}</span>
              </div>

              <p className="mb-3 font-display text-lg font-bold text-white">{plan.name}</p>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="text-xs text-success">✓</span> {f}
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

        <AnimatePresence>
          {selected !== 'free' && (
            <motion.button
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleSubscribe}
              disabled={subscribeState !== 'idle'}
              className={`mb-4 w-full rounded-2xl py-4 text-base font-bold text-white shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60 ${
                subscribeState === 'error' ? 'bg-red-600' : 'bg-coral-gradient'
              }`}
            >
              {subscribeLabel}
            </motion.button>
          )}
        </AnimatePresence>

        {errorMsg && (
          <p className="mb-3 text-center text-xs text-red-400">{errorMsg}</p>
        )}

        <p className="mb-8 text-center text-xs text-neutral-600">
          Отменить подписку можно в любой момент. Без скрытых списаний.
        </p>

        <h2 className="mb-4 font-display text-lg font-bold text-white">Разовые покупки</h2>
        <div className="flex flex-col gap-3">
          {ONE_TIME.map((item) => {
            const state = purchaseStates[item.id] ?? 'idle'
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-glass-border bg-card px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOneTime(item.id)}
                  disabled={state !== 'idle'}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-glow transition-opacity disabled:opacity-60 ${
                    state === 'error' ? 'bg-red-600 text-white' : 'bg-coral-gradient text-white'
                  }`}
                >
                  {state === 'loading' ? '...' : state === 'error' ? 'Ошибка' : item.price}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
