import { useMemo } from 'react'

const ECO_EMOJIS = ['🌿', '🌱', '♻️', '🌍', '⚡', '☀️', '💧', '🍃', '🌲', '🌾', '🦋', '🌻']
const ECO_SYMBOLS = ['✦', '◆', '●', '▲', '◉']

export default function ParticleBackground({ count = 14, showSymbols = false }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      content: showSymbols && i % 3 === 0
        ? ECO_SYMBOLS[i % ECO_SYMBOLS.length]
        : ECO_EMOJIS[i % ECO_EMOJIS.length],
      isSymbol: showSymbols && i % 3 === 0,
      top: `${5 + Math.random() * 85}%`,
      left: `${2 + Math.random() * 92}%`,
      duration: `${4 + Math.random() * 5}s`,
      delay: `-${Math.random() * 5}s`,
      size: showSymbols && i % 3 === 0 ? 0.4 + Math.random() * 0.4 : 0.7 + Math.random() * 0.9,
      opacity: 0.08 + Math.random() * 0.18,
    })),
    [count, showSymbols]
  )

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
            color: p.isSymbol ? '#10b981' : undefined,
            filter: p.isSymbol ? 'none' : undefined,
          }}
        >
          {p.content}
        </div>
      ))}
    </div>
  )
}
