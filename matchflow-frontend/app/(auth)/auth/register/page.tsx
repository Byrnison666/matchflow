'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { AuthResponse } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email: form.email,
        password: form.password,
      })
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      router.replace('/onboarding')
    } catch {
      setError('Этот email уже занят')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 w-full max-w-sm"
    >
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl text-white">
          Match<span className="text-accent-from">Flow</span>
        </Link>
        <p className="text-neutral-400 text-sm mt-2">Создай аккаунт — это бесплатно</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-glass-border shadow-modal">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              required
              className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from transition-colors"
            />
          </div>

          <div>
            <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="минимум 8 символов"
              required
              minLength={8}
              className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from transition-colors"
            />
          </div>

          <div>
            <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Повтори пароль</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              required
              className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from transition-colors"
            />
          </div>

          {error && (
            <p className="text-error text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-coral-gradient text-white font-semibold py-3.5 rounded-xl text-sm mt-1 shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isLoading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-neutral-600 text-xs text-center mt-4 leading-relaxed">
          Регистрируясь, ты соглашаешься с{' '}
          <a href="#" className="text-neutral-400 hover:text-white">условиями использования</a>
        </p>

        <p className="text-center text-neutral-500 text-sm mt-3">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-accent-from hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
