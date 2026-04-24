'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import { useLocation } from '@/hooks/useLocation'

const INTERESTS = [
  'Музыка', 'Путешествия', 'Еда', 'Спорт', 'Кино', 'Книги',
  'Фото', 'Танцы', 'Йога', 'Готовка', 'Игры', 'Искусство',
  'Природа', 'Фитнес', 'Кофе', 'Собаки', 'Кошки', 'Технологии',
]

const GENDERS = [
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
  { value: 'non_binary', label: 'Небинарный' },
  { value: 'other', label: 'Другое' },
]

const TOTAL_STEPS = 4

interface Step1Data { name: string; birthdate: string; gender: string }
interface Step3Data { bio: string; interests: string[] }

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-6 pt-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-neutral-700">
          <motion.div
            className="h-full bg-coral-gradient"
            initial={false}
            animate={{ width: i < step ? '100%' : i === step - 1 ? '100%' : '0%' }}
            transition={{ duration: 0.4 }}
          />
        </div>
      ))}
    </div>
  )
}

function Step1({ data, onChange }: { data: Step1Data; onChange: (d: Partial<Step1Data>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-white mb-1">Как тебя зовут?</h2>
        <p className="text-neutral-400 text-sm">Это будет видно другим пользователям</p>
      </div>

      <div>
        <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Имя</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Твоё имя"
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from transition-colors"
        />
      </div>

      <div>
        <label className="text-neutral-400 text-xs font-medium mb-1.5 block">Дата рождения</label>
        <input
          type="date"
          value={data.birthdate}
          onChange={(e) => onChange({ birthdate: e.target.value })}
          max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-from transition-colors [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="text-neutral-400 text-xs font-medium mb-2 block">Пол</label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onChange({ gender: g.value })}
              className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                data.gender === g.value
                  ? 'bg-accent-muted border-accent-from text-accent-from'
                  : 'bg-secondary border-glass-border text-neutral-300 hover:border-neutral-500'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step2({ photos, onChange }: { photos: File[]; onChange: (files: File[]) => void }) {
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    onChange([...photos, ...files].slice(0, 6))
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    onChange([...photos, ...files].slice(0, 6))
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-white mb-1">Добавь фото</h2>
        <p className="text-neutral-400 text-sm">Минимум 1, максимум 6. Первое — главное.</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-neutral-600 rounded-xl p-6 text-center hover:border-accent-from transition-colors"
      >
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple onChange={handleInput} className="hidden" />
          <div className="text-3xl mb-2">📷</div>
          <p className="text-neutral-400 text-sm">Перетащи или <span className="text-accent-from underline">выбери файлы</span></p>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-700">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-accent-from text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Главное
                </span>
              )}
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Step3({ data, onChange }: { data: Step3Data; onChange: (d: Partial<Step3Data>) => void }) {
  function toggleInterest(interest: string) {
    const current = data.interests
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest].slice(0, 10)
    onChange({ interests: next })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-white mb-1">О себе</h2>
        <p className="text-neutral-400 text-sm">Коротко и честно — это привлекает</p>
      </div>

      <div>
        <label className="text-neutral-400 text-xs font-medium mb-1.5 block">
          Биография{' '}
          <span className="text-neutral-600">({data.bio.length}/300)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value.slice(0, 300) })}
          placeholder="Расскажи пару слов о себе..."
          rows={4}
          className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from transition-colors resize-none"
        />
      </div>

      <div>
        <label className="text-neutral-400 text-xs font-medium mb-2 block">
          Интересы{' '}
          <span className="text-neutral-600">({data.interests.length}/10)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                data.interests.includes(interest)
                  ? 'bg-accent-muted border-accent-from text-accent-from'
                  : 'bg-secondary border-glass-border text-neutral-300 hover:border-neutral-500'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step4({ onAllow }: { onAllow: () => void }) {
  const [manual, setManual] = useState(false)
  const [city, setCity] = useState('')
  const [searching, setSearching] = useState(false)
  const [geoError, setGeoError] = useState('')

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim()) return
    setSearching(true)
    setGeoError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'ru' } },
      )
      const results = await res.json() as Array<{ lat: string; lon: string; display_name: string }>
      if (!results.length) {
        setGeoError('Город не найден. Попробуй ещё раз.')
        return
      }
      const { lat, lon } = results[0]
      await fetch('/api/location-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: parseFloat(lat), lng: parseFloat(lon) }),
      }).catch(() => {})
      onAllow()
    } catch {
      setGeoError('Ошибка поиска. Проверь подключение.')
    } finally {
      setSearching(false)
    }
  }

  if (manual) {
    return (
      <div className="flex flex-col gap-6 items-center text-center">
        <div className="text-6xl">📍</div>
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Укажи город</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Введи название города — мы найдём людей рядом.
          </p>
        </div>
        <form onSubmit={handleManualSubmit} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Москва, Санкт-Петербург..."
            className="w-full bg-secondary border border-glass-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-accent-from"
          />
          {geoError && <p className="text-xs text-red-400 text-center">{geoError}</p>}
          <button
            type="submit"
            disabled={!city.trim() || searching}
            className="w-full bg-coral-gradient text-white font-semibold py-3.5 rounded-xl text-sm shadow-glow disabled:opacity-60"
          >
            {searching ? 'Ищем...' : 'Подтвердить'}
          </button>
        </form>
        <button onClick={() => setManual(false)} className="text-neutral-500 text-sm">
          ← Назад
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="text-6xl">📍</div>
      <div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Включи геолокацию</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Мы используем твоё местоположение только для показа людей поблизости. Точные координаты никому не передаются.
        </p>
      </div>
      <button
        onClick={onAllow}
        className="w-full bg-coral-gradient text-white font-semibold py-3.5 rounded-xl text-sm shadow-glow"
      >
        Разрешить геолокацию
      </button>
      <button onClick={() => setManual(true)} className="text-neutral-500 text-sm hover:text-neutral-300 transition-colors">
        Задать вручную
      </button>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [step1, setStep1] = useState<Step1Data>({ name: '', birthdate: '', gender: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [step3, setStep3] = useState<Step3Data>({ bio: '', interests: [] })

  const canNext = useCallback(() => {
    if (step === 1) return step1.name.trim().length >= 2 && step1.birthdate && step1.gender
    if (step === 2) return photos.length >= 1
    if (step === 3) return true
    return false
  }, [step, step1, photos, step3])

  async function handleComplete() {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', step1.name)
      formData.append('birthdate', step1.birthdate)
      formData.append('gender', step1.gender)
      formData.append('bio', step3.bio)
      step3.interests.forEach((i) => formData.append('interests[]', i))
      photos.forEach((p) => formData.append('photos', p))

      const { data } = await apiClient.post('/users/me/onboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (user) setUser({ ...user, isOnboarded: true, name: step1.name })
      router.replace('/app/discover')
    } catch {
      router.replace('/app/discover')
    } finally {
      setIsSubmitting(false)
    }
  }

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else handleComplete()
  }

  function back() {
    if (step > 1) setStep((s) => s - 1)
  }

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar step={step} />

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1"
          >
            {step === 1 && <Step1 data={step1} onChange={(d) => setStep1((s) => ({ ...s, ...d }))} />}
            {step === 2 && <Step2 photos={photos} onChange={setPhotos} />}
            {step === 3 && <Step3 data={step3} onChange={(d) => setStep3((s) => ({ ...s, ...d }))} />}
            {step === 4 && <Step4 onAllow={() => next()} />}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={back}
                className="flex-none bg-secondary border border-glass-border text-white font-medium px-6 py-3.5 rounded-xl text-sm hover:bg-neutral-700 transition-colors"
              >
                Назад
              </button>
            )}
            <button
              onClick={next}
              disabled={!canNext() || isSubmitting}
              className="flex-1 bg-coral-gradient text-white font-semibold py-3.5 rounded-xl text-sm shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {step === TOTAL_STEPS - 1 ? (isSubmitting ? 'Сохраняем...' : 'Готово') : 'Далее'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
