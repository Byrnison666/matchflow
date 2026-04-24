'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { Profile } from '@/lib/types'

const SWIPE_THRESHOLD = 120
const ROTATION_FACTOR = 0.08

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'right' | 'left' | 'super') => void
  isTop: boolean
  stackIndex: number
}

export function SwipeCard({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-25, 25])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0])
  const superOpacity = useTransform(y, [-120, -20], [1, 0])
  const cardOpacity = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0.5, 0.9, 1, 0.9, 0.5]
  )

  const constraintsRef = useRef(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const mainPhoto = profile.photos[photoIndex] ?? profile.photos[0]

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y < -SWIPE_THRESHOLD && Math.abs(info.offset.x) < 60) {
      onSwipe('super')
      return
    }
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right')
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left')
    }
  }

  const scaleForStack = 1 - stackIndex * 0.04
  const yOffsetForStack = stackIndex * 10

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-card overflow-hidden"
        style={{
          scale: scaleForStack,
          y: yOffsetForStack,
          zIndex: 10 - stackIndex,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-full h-full bg-card" />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-card overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ x, y, rotate, opacity: cardOpacity, zIndex: 20 }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full">
        <Image
          src={mainPhoto.url}
          alt={profile.name}
          fill
          className="object-cover pointer-events-none"
          priority
          sizes="(max-width: 480px) 100vw, 480px"
        />

        <div className="absolute inset-0 bg-card-overlay" />

        <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
          {profile.photos.map((p, i) => (
            <button
              key={p.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === photoIndex ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={() => setPhotoIndex(i)}
            />
          ))}
        </div>

        <motion.div
          className="absolute top-6 left-6 border-4 border-green-400 rounded-lg px-3 py-1 rotate-[-15deg]"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-green-400 font-bold text-2xl tracking-widest">ЛАЙК</span>
        </motion.div>

        <motion.div
          className="absolute top-6 right-6 border-4 border-red-400 rounded-lg px-3 py-1 rotate-[15deg]"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-red-400 font-bold text-2xl tracking-widest">НЕЕЕТ</span>
        </motion.div>

        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2 border-4 border-blue-400 rounded-lg px-3 py-1"
          style={{ opacity: superOpacity }}
        >
          <span className="text-blue-400 font-bold text-2xl tracking-widest">СУПЕР</span>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-2 mb-1">
            <h2 className="font-display font-bold text-white text-2xl leading-tight">
              {profile.name}, {profile.age}
            </h2>
            {profile.isVerified && (
              <svg className="w-6 h-6 text-blue-400 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {profile.distanceKm < 1000 && (
            <p className="text-white/60 text-sm mb-2">{profile.distanceKm} км от тебя</p>
          )}

          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.interests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-white/10 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/15"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {profile.aiIcebreaker && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
              <p className="text-white/80 text-xs leading-relaxed">
                <span className="text-accent-from font-semibold">✨ </span>
                {profile.aiIcebreaker}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

