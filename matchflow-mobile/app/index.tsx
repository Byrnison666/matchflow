import { Redirect } from 'expo-router'
import { useAuthStore } from '@/lib/store/auth.store'

export default function IndexPage() {
  const user = useAuthStore((s) => s.user)

  if (user && user.isOnboarded) {
    return <Redirect href="/(app)/discover" />
  }
  if (user && !user.isOnboarded) {
    return <Redirect href="/(onboarding)" />
  }
  return <Redirect href="/(auth)/login" />
}
