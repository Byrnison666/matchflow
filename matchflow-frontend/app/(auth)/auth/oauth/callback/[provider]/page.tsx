'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth.store'
import type { AuthResponse } from '@/lib/types'

type OAuthProvider = 'google' | 'yandex'

function OAuthCallbackContent({ provider }: { provider: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [error, setError] = useState('')

  useEffect(() => {
    async function finishOAuth() {
      if (provider !== 'google' && provider !== 'yandex') {
        setError('Неподдерживаемый OAuth-провайдер')
        return
      }

      const oauthError = searchParams.get('error')
      if (oauthError) {
        setError('Вход через соцсеть был отменён')
        return
      }

      const code = searchParams.get('code')
      const state = searchParams.get('state')
      if (!code || !state) {
        setError('OAuth callback пришёл без code/state')
        return
      }

      const typedProvider = provider as OAuthProvider
      const expectedState = sessionStorage.getItem(`oauth:${typedProvider}:state`)
      if (!expectedState || expectedState !== state) {
        setError('Не удалось проверить OAuth state')
        return
      }

      const redirect =
        sessionStorage.getItem(`oauth:${typedProvider}:redirect`) || '/app/discover'
      const redirectUri = `${window.location.origin}/auth/oauth/callback/${typedProvider}`

      try {
        const { data } = await apiClient.post<AuthResponse>(
          `/auth/oauth/${typedProvider}/callback`,
          { code, redirectUri }
        )

        sessionStorage.removeItem(`oauth:${typedProvider}:state`)
        sessionStorage.removeItem(`oauth:${typedProvider}:redirect`)

        setTokens(data.accessToken, data.refreshToken)
        setUser(data.user)
        router.replace(data.user.isOnboarded ? redirect : '/onboarding')
      } catch {
        setError('Не удалось завершить вход через соцсеть')
      }
    }

    finishOAuth()
  }, [provider, router, searchParams, setTokens, setUser])

  return (
    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-glass-border bg-card p-6 text-center shadow-modal">
      <Link href="/" className="font-display text-2xl font-bold text-white">
        Match<span className="text-accent-from">Flow</span>
      </Link>

      {error ? (
        <>
          <p className="mt-4 text-sm text-error">{error}</p>
          <Link
            href="/auth/login"
            className="mt-5 inline-flex rounded-xl bg-coral-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Вернуться ко входу
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto mt-6 h-12 w-12 rounded-full bg-coral-gradient animate-pulse" />
          <p className="mt-4 text-sm text-neutral-400">Завершаем вход...</p>
        </>
      )}
    </div>
  )
}

export default function OAuthCallbackPage({
  params,
}: {
  params: { provider: string }
}) {
  return (
    <Suspense>
      <OAuthCallbackContent provider={params.provider} />
    </Suspense>
  )
}
