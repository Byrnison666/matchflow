import axios, { type InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '@/lib/store/auth.store'
import { router } from 'expo-router'

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken')

      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001'}/auth/refresh`,
        { refreshToken },
      )

      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)

      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch {
      refreshQueue = []
      useAuthStore.getState().logout()
      router.replace('/(auth)/login')
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)
