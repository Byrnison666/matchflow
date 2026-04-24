'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const MOCK_CARDS = [
  { name: 'Анна', age: 24, emoji: '🌸', color: 'from-pink-500 to-rose-400' },
  { name: 'Михаил', age: 28, emoji: '🏄', color: 'from-blue-500 to-cyan-400' },
  { name: 'Соня', age: 22, emoji: '🎨', color: 'from-purple-500 to-pink-400' },
  { name: 'Артём', age: 26, emoji: '🎸', color: 'from-orange-500 to-yellow-400' },
  { name: 'Лиза', age: 23, emoji: '✈️', color: 'from-emerald-500 to-teal-400' },
  { name: 'Денис', age: 29, emoji: '📷', color: 'from-red-500 to-pink-400' },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Умный подбор',
    desc: 'Алгоритм учится на твоих свайпах и показывает тех, кто тебе действительно подходит.',
  },
  {
    icon: '🔒',
    title: 'Безопасный чат',
    desc: 'Зашифрованные сообщения, AI-фильтр токсичности и верификация фото.',
  },
  {
    icon: '👥',
    title: 'Реальные люди',
    desc: 'Проверка фото через liveness-check. Никаких ботов и фейков.',
  },
  {
    icon: '💬',
    title: 'AI-ледокол',
    desc: 'Не знаешь с чего начать? AI предложит персональную фразу под конкретный профиль.',
  },
]

const SUCCESS_STORIES = [
  { names: 'Алина и Кирилл', text: 'Познакомились в MatchFlow 8 месяцев назад. Теперь живём вместе 🏡', city: 'Москва' },
  { names: 'Даша и Игорь', text: 'Сначала просто переписывались, потом встретились в кофейне — и не расстаёмся', city: 'СПб' },
  { names: 'Маша и Толя', text: 'Супер-лайк изменил всё. Теперь планируем свадьбу 💍', city: 'Казань' },
]

function FloatingCard({ name, age, emoji, color, delay }: typeof MOCK_CARDS[0] & { delay: number }) {
  return (
    <motion.div
      className={`relative rounded-card overflow-hidden bg-gradient-to-br ${color} w-32 h-44 flex flex-col justify-end p-3 shadow-card flex-shrink-0`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.04, y: -4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="text-3xl absolute top-3 right-3">{emoji}</div>
      <div className="relative">
        <p className="text-white font-bold text-sm leading-tight">{name}, {age}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -80])

  return (
    <div className="min-h-screen bg-primary">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-primary/80 backdrop-blur-md border-b border-glass-border">
        <span className="font-display font-bold text-xl text-white">
          Match<span className="text-accent-from">Flow</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-neutral-300 text-sm font-medium hover:text-white transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/auth/register"
            className="bg-coral-gradient text-white text-sm font-semibold px-4 py-2 rounded-full shadow-glow hover:opacity-90 transition-opacity"
          >
            Начать
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent-from/10 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-accent-to/8 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 bg-glass rounded-full px-4 py-2 mb-6 border border-glass-border">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-online" />
            <span className="text-neutral-300 text-xs font-medium">127 842 активных пользователей</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white leading-tight mb-6">
            Найди своего{' '}
            <span className="bg-coral-gradient bg-clip-text text-transparent">
              человека
            </span>
          </h1>

          <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Умный подбор, живой чат, реальные встречи. Без ботов, без фейков — только настоящие люди.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-coral-gradient text-white font-semibold px-8 py-4 rounded-full text-base shadow-glow hover:opacity-90 transition-opacity"
            >
              Создать аккаунт — бесплатно
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto bg-glass text-white font-medium px-8 py-4 rounded-full text-base border border-glass-border hover:bg-neutral-700 transition-colors"
            >
              Уже есть аккаунт
            </Link>
          </div>
        </motion.div>

        {/* Card grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 flex gap-4 mt-16 overflow-x-auto no-scrollbar px-4"
        >
          {MOCK_CARDS.map((card, i) => (
            <FloatingCard key={card.name} {...card} delay={0.5 + i * 0.08} />
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="py-24 px-6 bg-secondary">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Почему MatchFlow?
            </h2>
            <p className="text-neutral-400 text-base max-w-md mx-auto">
              Объединили лучшее из дейтинг-приложений в одно место
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-glass-border hover:border-accent-muted transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Реальные истории
            </h2>
            <p className="text-neutral-400 text-base">Тысячи пар нашли друг друга в MatchFlow</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SUCCESS_STORIES.map((s, i) => (
              <motion.div
                key={s.names}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-card rounded-xl p-6 border border-glass-border"
              >
                <p className="text-neutral-300 text-sm leading-relaxed mb-4">"{s.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{s.names}</p>
                  <p className="text-neutral-500 text-xs">{s.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-secondary">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Начни прямо сейчас
          </h2>
          <p className="text-neutral-400 mb-8">Регистрация занимает 2 минуты. Первый мэтч может быть сегодня.</p>
          <Link
            href="/auth/register"
            className="inline-block bg-coral-gradient text-white font-semibold px-10 py-4 rounded-full text-base shadow-glow hover:opacity-90 transition-opacity"
          >
            Создать аккаунт бесплатно
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-glass-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-white">
            Match<span className="text-accent-from">Flow</span>
          </span>
          <div className="flex gap-6 text-neutral-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Условия использования</a>
            <a href="#" className="hover:text-white transition-colors">Поддержка</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
