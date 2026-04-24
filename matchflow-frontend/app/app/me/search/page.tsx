'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'matchflow:search_settings'

interface SearchSettings {
  ageMin: number
  ageMax: number
  distanceKm: number
  genderPref: 'all' | 'women' | 'men'
}

const DEFAULTS: SearchSettings = { ageMin: 18, ageMax: 45, distanceKm: 25, genderPref: 'all' }
const DISTANCES = [5, 10, 25, 50, 100]
const GENDER_OPTIONS: Array<{ value: SearchSettings['genderPref']; label: string }> = [
  { value: 'all', label: 'Всех' },
  { value: 'women', label: 'Женщин' },
  { value: 'men', label: 'Мужчин' },
]

export default function SearchSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SearchSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSettings(JSON.parse(raw))
    } catch {}
  }, [])

  function update<K extends keyof SearchSettings>(key: K, value: SearchSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => router.back(), 700)
  }

  return (
    <div className="min-h-full bg-primary px-5 pt-12 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-white transition-colors">
          ←
        </button>
        <h1 className="font-display text-2xl font-bold text-white">Настройки поиска</h1>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium text-neutral-400">Возраст</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] text-neutral-600">От</label>
              <input
                type="number"
                min={18}
                max={settings.ageMax - 1}
                value={settings.ageMin}
                onChange={(e) => update('ageMin', Number(e.target.value))}
                className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-sm text-white focus:border-accent-from focus:outline-none"
              />
            </div>
            <span className="mt-4 text-neutral-600">—</span>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] text-neutral-600">До</label>
              <input
                type="number"
                min={settings.ageMin + 1}
                max={100}
                value={settings.ageMax}
                onChange={(e) => update('ageMax', Number(e.target.value))}
                className="w-full rounded-xl border border-glass-border bg-secondary px-4 py-3 text-sm text-white focus:border-accent-from focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-neutral-400">Расстояние (км)</p>
          <div className="flex gap-2 flex-wrap">
            {DISTANCES.map((d) => (
              <button
                key={d}
                onClick={() => update('distanceKm', d)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  settings.distanceKm === d
                    ? 'border-accent-from bg-accent-muted text-white'
                    : 'border-glass-border bg-secondary text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {d} км
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-neutral-400">Ищу</p>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('genderPref', opt.value)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                  settings.genderPref === opt.value
                    ? 'border-accent-from bg-accent-muted text-white'
                    : 'border-glass-border bg-secondary text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-2 w-full rounded-2xl bg-coral-gradient py-4 text-base font-bold text-white shadow-glow hover:opacity-90 transition-opacity"
        >
          {saved ? 'Сохранено ✓' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
