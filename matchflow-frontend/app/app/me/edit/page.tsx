'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'

const INTERESTS = [
  'Путешествия', 'Музыка', 'Кино', 'Спорт', 'Готовка', 'Чтение',
  'Игры', 'Фото', 'Искусство', 'Танцы', 'Йога', 'Природа',
]

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  async function handleSave() {
    setIsLoading(true)
    try {
      await apiClient.put('/users/me', { name, bio, interests })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setUser({ ...user!, name })
      setSaved(true)
      setTimeout(() => router.back(), 800)
    } catch {
      // ignore
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
        <h1 className="font-display text-2xl font-bold text-white">Редактировать профиль</h1>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-accent-from focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">О себе</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Расскажи о себе..."
            className="w-full resize-none rounded-xl border border-glass-border bg-secondary px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-accent-from focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-3 block text-xs font-medium text-neutral-400">Интересы</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'border-accent-from bg-accent-muted text-accent-from'
                    : 'border-glass-border bg-secondary text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={isLoading || !name.trim()}
          animate={saved ? { scale: [1, 1.04, 1] } : {}}
          className="mt-2 w-full rounded-2xl bg-coral-gradient py-4 text-base font-bold text-white shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saved ? 'Сохранено ✓' : isLoading ? 'Сохраняем...' : 'Сохранить'}
        </motion.button>
      </div>
    </div>
  )
}
