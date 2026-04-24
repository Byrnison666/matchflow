'use client'

import { useState } from 'react'
import axios from 'axios'
import { apiClient } from '@/lib/api/client'

type OAuthProvider = 'google' | 'yandex'

const PROVIDERS: Array<{
  id: OAuthProvider
  label: string
  icon: string
  className: string
}> = [
  {
    id: 'google',
    label: 'Google',
    icon: 'G',
    className: 'bg-white text-neutral-950 hover:bg-white/90',
  },
  {
    id: 'yandex',
    label: 'Яндекс',
    icon: 'Я',
    className: 'bg-[#fc3f1d] text-white hover:bg-[#e83a1c]',
  },
]

interface OAuthButtonsProps {
  redirect?: string
}

export function OAuthButtons({ redirect = '/app/discover' }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState('')

  async function startOAuth(provider: OAuthProvider) {
    if (typeof window === 'undefined') return

    setError('')
    setLoadingProvider(provider)

    try {
      const state = crypto.randomUUID()
      const redirectUri = `${window.location.origin}/auth/oauth/callback/${provider}`

      sessionStorage.setItem(`oauth:${provider}:state`, state)
      sessionStorage.setItem(`oauth:${provider}:redirect`, redirect)

      const { data } = await apiClient.get<{ url: string }>(`/auth/oauth/${provider}/url`, {
        params: { redirectUri, state },
      })

      window.location.assign(data.url)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setError('Backend недоступен. Запусти сервер на localhost:3001')
        } else if (error.response.status === 400) {
          setError('OAuth не настроен: добавь client id и secret в backend .env')
        } else {
          setError('Backend отклонил OAuth-запрос')
        }
      } else {
        setError('Не удалось открыть вход через соцсеть')
      }
      setLoadingProvider(null)
    }
  }

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          или
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => startOAuth(provider.id)}
            className={`${provider.className} flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-xs">
              {provider.icon}
            </span>
            {loadingProvider === provider.id ? 'Открываем...' : provider.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-center text-xs text-error">{error}</p>}
    </div>
  )
}
