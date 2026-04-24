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
    <div className="relative flex min-h-screen justify-center overflow-hidden bg-primary">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="mesh-orb absolute -left-24 top-8 h-64 w-64 rounded-full opacity-50 animate-meshFloat" />
        <div className="mesh-orb absolute -right-28 bottom-28 h-72 w-72 rounded-full opacity-35 animate-meshFloat [animation-delay:-4s]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full max-w-lg flex-col border-x border-white/5 bg-primary/[0.74] shadow-premium backdrop-blur-xl">
        <main className="flex-1 overflow-y-auto pb-24">{children}</main>

        <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-[500px] -translate-x-1/2 safe-bottom">
          <div className="flex rounded-[28px] border border-white/10 bg-secondary/[0.82] p-1.5 shadow-glass backdrop-blur-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const showBadge = item.href === '/app/matches' && totalUnread > 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] py-2.5 transition-all ${
                    isActive
                      ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300'
                  }`}
                >
                  <span className="relative text-xl leading-none">
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
    </div>
  )
}
