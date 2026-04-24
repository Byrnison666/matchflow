'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function SecurityPage() {
  const router = useRouter()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.next !== form.confirm) {
      setError('Пароли не совпадают')
      return
    }
    if (form.next.length < 8) {
      setError('Новый пароль — минимум 8 символов')
      return
    }

    setIsLoading(true)
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      })
      setSuccess(true)
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setError('Неверный текущий пароль')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-primary px-5 pt-12 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-white transition-colors">
          ←
        </button>
        <h1 className="font-display text-2xl font-bold text-white">Безопасность</h1>
      </div>

      <div className="rounded-[26px] border border-white/10 bg-card/80 p-5 shadow-glass backdrop-blur-xl">
        <p className="mb-5 text-sm font-semibold text-white">Изменить пароль</p>

        {success ? (
          <p className="text-center text-sm text-green-400">Пароль успешно изменён</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { field: 'current', label: 'Текущий пароль' },
              { field: 'next', label: 'Новый пароль' },
              { field: 'confirm', label: 'Повтори новый пароль' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</label>
                <input
                  type="password"
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-accent-from focus:outline-none"
                />
              </div>
            ))}

            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-2xl bg-coral-gradient py-4 text-sm font-bold text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isLoading ? 'Сохраняем...' : 'Сменить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
