/**
 * Animated floating particles for hero/landing sections.
 */
import { useMemo } from 'react'

const EMOJIS = ['🌿', '🌱', '♻️', '🌍', '⚡', '☀️', '💧', '🍃']

export default function ParticleBackground({ count = 12 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 95}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 3}s`,
      size: 0.6 + Math.random() * 0.8,
      opacity: 0.15 + Math.random() * 0.2,
    })),
  [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute particle select-none"
          style={{
            top: p.top,
            left: p.left,
            '--duration': p.duration,
            '--delay': p.delay,
            fontSize: `${p.size}rem`,
            opacity: p.opacity,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
