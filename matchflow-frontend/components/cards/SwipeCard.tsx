'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { Profile } from '@/lib/types'

const SWIPE_THRESHOLD = 120

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'right' | 'left' | 'super') => void
  isTop: boolean
  stackIndex: number
}

export function SwipeCard({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18])
  const imageX = useTransform(x, [-300, 300], [-18, 18])
  const glowOpacity = useTransform(x, [-180, 0, 180], [0.35, 0, 0.35])
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
  const yOffsetForStack = stackIndex * 12

  if (!isTop) {
    const stackPhoto = profile.photos[0]

    return (
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-card shadow-card"
        style={{
          scale: scaleForStack,
          y: yOffsetForStack,
          zIndex: 10 - stackIndex,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {stackPhoto ? (
          <Image
            src={stackPhoto.url}
            alt=""
            fill
            className="object-cover opacity-45 blur-[1px] saturate-75"
            sizes="(max-width: 480px) 100vw, 480px"
          />
        ) : (
          <div className="h-full w-full bg-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-white/5" />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab select-none overflow-hidden rounded-[28px] border border-white/10 shadow-premium active:cursor-grabbing"
      style={{ x, y, rotate, opacity: cardOpacity, zIndex: 20 }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.015 }}
    >
      <div className="relative w-full h-full">
        <motion.div className="absolute inset-0" style={{ x: imageX }}>
          <Image
            src={mainPhoto.url}
            alt={profile.name}
            fill
            className="pointer-events-none scale-110 object-cover"
            priority
            sizes="(max-width: 480px) 100vw, 480px"
          />
        </motion.div>

        <div className="absolute inset-0 bg-card-overlay" />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(255,75,110,0.16),transparent_35%,rgba(45,212,191,0.14))]"
          style={{ opacity: glowOpacity }}
        />

        <div className="absolute left-0 right-0 top-4 flex justify-center gap-1 px-4">
          {profile.photos.map((p, i) => (
            <button
              key={p.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === photoIndex ? 'bg-white shadow-[0_0_16px_rgba(255,255,255,0.55)]' : 'bg-white/25'
              }`}
              onClick={() => setPhotoIndex(i)}
            />
          ))}
        </div>

        <motion.div
          className="absolute left-6 top-8 rotate-[-15deg] rounded-2xl border-4 border-emerald-300 bg-emerald-400/10 px-4 py-1.5 shadow-[0_0_28px_rgba(52,211,153,0.28)]"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-2xl font-extrabold tracking-widest text-emerald-300">ЛАЙК</span>
        </motion.div>

        <motion.div
          className="absolute right-6 top-8 rotate-[15deg] rounded-2xl border-4 border-rose-300 bg-rose-400/10 px-4 py-1.5 shadow-[0_0_28px_rgba(251,113,133,0.28)]"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-2xl font-extrabold tracking-widest text-rose-300">НЕЕЕТ</span>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-8 -translate-x-1/2 rounded-2xl border-4 border-sky-300 bg-sky-400/10 px-4 py-1.5 shadow-[0_0_28px_rgba(56,189,248,0.28)]"
          style={{ opacity: superOpacity }}
        >
          <span className="text-2xl font-extrabold tracking-widest text-sky-300">СУПЕР</span>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-2 mb-1">
            <h2 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-lg">
              {profile.name}, {profile.age}
            </h2>
            {profile.isVerified && (
              <svg className="mb-1 h-6 w-6 text-sky-300 drop-shadow-[0_0_12px_rgba(125,211,252,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {profile.isOnline && (
              <span className="mb-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                online
              </span>
            )}
          </div>

          {profile.distanceKm < 1000 && (
            <p className="mb-2 text-sm font-medium text-white/[0.68]">{profile.distanceKm} км от тебя</p>
          )}

          {profile.interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {profile.bio && (
            <div className="mb-3 rounded-2xl border border-white/[0.12] bg-white/[0.075] p-3 backdrop-blur-md">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Prompt
              </p>
              <p className="text-sm font-semibold leading-snug text-white/90">{profile.bio}</p>
            </div>
          )}

          {profile.aiIcebreaker && (
            <div className="relative overflow-hidden rounded-2xl border border-accent-from/25 bg-accent-muted p-3 shadow-[0_0_26px_rgba(255,75,110,0.18)] backdrop-blur-md">
              <div className="absolute -right-4 -top-5 h-14 w-14 rounded-full bg-accent-from/35 blur-2xl" />
              <p className="relative text-xs leading-relaxed text-white/[0.84]">
                <span className="font-semibold text-accent-from">AI </span>
                {profile.aiIcebreaker}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
