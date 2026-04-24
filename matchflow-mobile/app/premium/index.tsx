import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { openURL } from 'expo-linking'
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
    borderColor: '#242424',
    badge: '',
    features: ['20 лайков в день', 'Базовый чат', 'Стандартный поиск', 'Реклама'],
    disabled: ['Кто лайкнул', 'Безлимитные лайки', 'Инкогнито', 'Буст', 'Суперлайки'],
  },
  {
    tier: 'plus' as SubscriptionTier,
    name: 'Plus',
    price: '699',
    period: '/мес',
    borderColor: '#3b82f6',
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
    borderColor: '#facc15',
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

export default function PremiumScreen() {
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
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/subscribe', {
        tier: selected,
      })
      await openURL(data.checkoutUrl)
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
      const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/purchase', {
        productId,
      })
      await openURL(data.checkoutUrl)
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
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 80 }}
      >
        <View className="flex-row items-center gap-3 mb-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-neutral-400 text-base">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">Premium</Text>
            <Text className="text-xs text-neutral-400">Разблокируй все возможности</Text>
          </View>
        </View>

        <View className="gap-4 mb-8">
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.tier}
              onPress={() => setSelected(plan.tier)}
              className="relative bg-card rounded-2xl p-5"
              style={{
                borderWidth: 2,
                borderColor: selected === plan.tier ? plan.borderColor : 'transparent',
              }}
              activeOpacity={0.85}
            >
              {plan.badge ? (
                <View
                  className="absolute right-3 top-3 rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor:
                      plan.tier === 'gold'
                        ? 'rgba(250,204,21,0.2)'
                        : 'rgba(59,130,246,0.2)',
                  }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: plan.tier === 'gold' ? '#facc15' : '#60a5fa' }}
                  >
                    {plan.badge}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-baseline gap-1 mb-4">
                <Text className="text-3xl font-bold text-white">{plan.price}</Text>
                {plan.price !== '0' && <Text className="text-sm text-neutral-400">₽</Text>}
                <Text className="text-sm text-neutral-500">{plan.period}</Text>
              </View>

              <Text className="text-lg font-bold text-white mb-3">{plan.name}</Text>

              <View className="gap-1.5">
                {plan.features.map((f) => (
                  <View key={f} className="flex-row items-center gap-2">
                    <Text className="text-xs text-success">✓</Text>
                    <Text className="text-sm text-neutral-300">{f}</Text>
                  </View>
                ))}
                {plan.disabled.map((f) => (
                  <View key={f} className="flex-row items-center gap-2">
                    <Text className="text-xs text-neutral-600">✕</Text>
                    <Text className="text-sm text-neutral-600">{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selected !== 'free' && (
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={subscribeState !== 'idle'}
            className="mb-4 w-full rounded-2xl py-4 items-center"
            style={{
              backgroundColor: subscribeState === 'error' ? '#dc2626' : '#FF4B6E',
              opacity: subscribeState !== 'idle' ? 0.6 : 1,
            }}
          >
            {subscribeState === 'loading' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">{subscribeLabel}</Text>
            )}
          </TouchableOpacity>
        )}

        {errorMsg ? (
          <Text className="mb-3 text-center text-xs text-red-400">{errorMsg}</Text>
        ) : null}

        <Text className="mb-8 text-center text-xs text-neutral-600">
          Отменить подписку можно в любой момент. Без скрытых списаний.
        </Text>

        <Text className="mb-4 text-lg font-bold text-white">Разовые покупки</Text>
        <View className="gap-3">
          {ONE_TIME.map((item) => {
            const state = purchaseStates[item.id] ?? 'idle'
            return (
              <View
                key={item.id}
                className="flex-row items-center justify-between rounded-xl border border-glass-border bg-card px-4 py-3.5"
              >
                <View className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                  <View>
                    <Text className="text-sm font-semibold text-white">{item.name}</Text>
                    <Text className="text-xs text-neutral-500">{item.desc}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleOneTime(item.id)}
                  disabled={state !== 'idle'}
                  className="rounded-full px-3 py-1.5 items-center"
                  style={{
                    backgroundColor: state === 'error' ? '#dc2626' : '#FF4B6E',
                    opacity: state !== 'idle' ? 0.6 : 1,
                  }}
                >
                  {state === 'loading' ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-xs font-bold text-white">
                      {state === 'error' ? 'Ошибка' : item.price}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
