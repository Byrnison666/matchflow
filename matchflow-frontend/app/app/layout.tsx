'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useChatStore } from '@/lib/store/chat.store'

const NAV_ITEMS = [
  { href: '/app/discover', icon: '🔥', label: 'Поиск' },
  { href: '/app/matches', icon: '💬', label: 'Мэтчи' },
  { href: '/app/me', icon: '👤', label: 'Профиль' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-primary">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-secondary/90 backdrop-blur-md border-t border-glass-border safe-bottom z-40">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const showBadge = item.href === '/app/matches' && totalUnread > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative ${
                  isActive ? 'text-accent-from' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span className="text-xl leading-none relative">
                  {item.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-accent-from text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
