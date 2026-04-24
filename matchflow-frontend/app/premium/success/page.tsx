'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { User } from '@/lib/types'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [status, setStatus] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    // Получаем свежие данные пользователя — ЮKassa уже должна была прислать вебхук
    // и активировать подписку/монеты до того, как пользователь вернулся сюда.
    async function refresh() {
      try {
        const { data } = await apiClient.get<User>('/users/me')
        setUser(data as unknown as User)
      } catch {
        // ignore — пользователь всё равно увидит актуальные данные при следующем запросе
      } finally {
        setStatus('done')
      }
    }

    // Небольшая задержка: даём время вебхуку дойти до бэкенда, если он чуть запаздывает
    const t = setTimeout(refresh, 1500)
    return () => clearTimeout(t)
  }, [setUser])

  function goToProfile() {
    router.replace('/app/me')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-[28px] border border-white/10 bg-card p-8 text-center shadow-premium"
      >
        {status === 'loading' ? (
          <>
            <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-coral-gradient animate-pulse" />
            <p className="text-sm text-neutral-400">Подтверждаем оплату...</p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-coral-gradient text-3xl shadow-glow"
            >
              ✓
            </motion.div>
            <h1 className="mb-2 font-display text-2xl font-bold text-white">Оплата прошла</h1>
            <p className="mb-6 text-sm text-neutral-400">
              Твой аккаунт обновлён. Наслаждайся новыми возможностями!
            </p>
            <button
              onClick={goToProfile}
              className="w-full rounded-2xl bg-coral-gradient py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-90 transition-opacity"
            >
              В профиль
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
