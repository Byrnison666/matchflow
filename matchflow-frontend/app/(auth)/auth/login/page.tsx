'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { AuthResponse } from '@/lib/types'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/app/discover'

  const setUser = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', form)
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      router.replace(data.user.isOnboarded ? redirect : '/onboarding')
    } catch {
      setError('Неверный email или пароль')
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
        <p className="text-neutral-400 text-sm mt-2">Войди в аккаунт</p>
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
              placeholder="••••••••"
              required
              minLength={6}
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
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-neutral-500 text-sm mt-4">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-accent-from hover:underline">
            Создать
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
