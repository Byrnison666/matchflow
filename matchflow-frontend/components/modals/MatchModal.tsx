'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import type { Match } from '@/lib/types'
import { matchModalVariants } from '@/lib/animations'

interface MatchModalProps {
  match: Match | null
  onClose: () => void
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!match) return

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FF4B6E', '#FF8C42', '#FFD700', '#FFFFFF'],
    })
  }, [match])

  function handleOpenChat() {
    if (!match) return
    onClose()
    router.push(`/app/chat/${match.id}`)
  }

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            className="relative z-10 w-full max-w-sm"
            variants={matchModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card rounded-2xl p-8 flex flex-col items-center text-center shadow-modal border border-glass-border">
              <motion.h1
                className="font-display font-bold text-3xl text-white mb-1"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Это мэтч! 🎉
              </motion.h1>
              <motion.p
                className="text-neutral-400 text-sm mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Вы понравились друг другу
              </motion.p>

              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-700 shadow-card"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Image src={match.myPhoto} alt="Ты" fill className="object-cover" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <span className="text-4xl">❤️</span>
                </motion.div>

                <motion.div
                  className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-700 shadow-card"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Image src={match.theirPhoto} alt={match.theirName} fill className="object-cover" />
                </motion.div>
              </div>

              <p className="text-white text-lg font-medium mb-6">
                Ты и {match.theirName}
              </p>

              <motion.div
                className="flex flex-col gap-3 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleOpenChat}
                  className="w-full bg-coral-gradient text-white font-semibold py-3.5 rounded-xl text-base shadow-glow hover:shadow-lg transition-shadow"
                >
                  Написать {match.theirName}
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-neutral-400 font-medium py-3 text-sm hover:text-white transition-colors"
                >
                  Продолжить свайпать
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
