import type { Variants } from 'framer-motion'

export const swipeVariants: Variants = {
  enter: {
    scale: 0.92,
    opacity: 0,
    y: 20,
  },
  center: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exitLeft: {
    x: '-120%',
    rotate: -30,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
  exitRight: {
    x: '120%',
    rotate: 30,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
  exitUp: {
    y: '-120%',
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

export const matchModalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 40,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const likeIndicatorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -15,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
}

export const messageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

export const paywallSlideUp: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 30 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.4, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}
