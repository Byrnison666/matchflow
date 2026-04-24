'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'matchflow:notifications'

interface NotifSettings {
  newMatches: boolean
  messages: boolean
  likes: boolean
  systemUpdates: boolean
}

const DEFAULTS: NotifSettings = { newMatches: true, messages: true, likes: true, systemUpdates: false }

const ITEMS: Array<{ key: keyof NotifSettings; label: string; desc: string }> = [
  { key: 'newMatches', label: 'Новые мэтчи', desc: 'Когда у тебя новый мэтч' },
  { key: 'messages', label: 'Сообщения', desc: 'Входящие сообщения в чате' },
  { key: 'likes', label: 'Лайки', desc: 'Кто-то тебя лайкнул (Plus+)' },
  { key: 'systemUpdates', label: 'Обновления', desc: 'Новости и обновления приложения' },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<NotifSettings>(DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSettings(JSON.parse(raw))
    } catch {}
  }, [])

  function toggle(key: keyof NotifSettings) {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <div className="min-h-full bg-primary px-5 pt-12 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-white transition-colors">
          ←
        </button>
        <h1 className="font-display text-2xl font-bold text-white">Уведомления</h1>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-card/80 shadow-glass backdrop-blur-xl">
        {ITEMS.map((item, i) => (
          <div
            key={item.key}
            className={`flex items-center justify-between px-4 py-4 ${
              i < ITEMS.length - 1 ? 'border-b border-glass-border' : ''
            }`}
          >
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings[item.key] ? 'bg-accent-from' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
