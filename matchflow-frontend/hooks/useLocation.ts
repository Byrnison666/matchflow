'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

interface LocationState {
  lat: number | null
  lng: number | null
  error: string | null
  isLoading: boolean
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    error: null,
    isLoading: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Геолокация не поддерживается браузером' }))
      return
    }

    setState((s) => ({ ...s, isLoading: true }))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        try {
          await apiClient.post('/users/me/location', { lat, lng })
          setState({ lat, lng, error: null, isLoading: false })
        } catch {
          setState({ lat, lng, error: null, isLoading: false })
        }
      },
      (err) => {
        setState({
          lat: null,
          lng: null,
          error: err.message,
          isLoading: false,
        })
      },
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }, [])

  return state
}
