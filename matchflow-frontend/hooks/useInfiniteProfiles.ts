'use client'

import { useEffect } from 'react'
import { useDiscoverStore } from '@/lib/store/discover.store'

export function useInfiniteProfiles() {
  const profiles = useDiscoverStore((s) => s.profiles)
  const isLoading = useDiscoverStore((s) => s.isLoading)
  const hasMore = useDiscoverStore((s) => s.hasMore)
  const loadFeed = useDiscoverStore((s) => s.loadFeed)

  useEffect(() => {
    if (profiles.length === 0) {
      loadFeed()
    }
  }, [profiles.length, loadFeed])

  return { profiles, loadMore: loadFeed, isLoading, hasMore }
}
