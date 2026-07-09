import { useEffect, useMemo, useRef, useState } from 'react'

const RAIN_COUNT = 80

function AnimatedTitle({ lines, animate, align = 'left' }) {
  const [visible, setVisible] = useState(() => new Set())
  const ran = useRef(false)

  const letters = useMemo(() => {
    const items = []
    lines.forEach((line, lineIndex) => {
      ;[...line].forEach((char, charIndex) => {
        items.push({
          key: `${lineIndex}-${charIndex}`,
          char,
          lineIndex,
          charIndex,
        })
      })
    })
    return items
  }, [lines])

  useEffect(() => {
    if (!animate) {
      setVisible(new Set(letters.map((l) => l.key)))
      return
    }

    // Guard against React StrictMode double-invoke
    if (ran.current) return
    ran.current = true

    const order = [...letters].sort(() => Math.random() - 0.5)
    const timers = []

    order.forEach((letter, i) => {
      const delay = 140 + i * 75 + Math.random() * 100
      timers.push(
        setTimeout(() => {
          setVisible((prev) => new Set(prev).add(letter.key))
        }, delay),
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [animate, letters])

  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-3 select-none ${alignClass}`}>
      {lines.map((line, lineIndex) => {
        const isMain = lineIndex === lines.length - 1
        const isMulti = lines.length > 1
        return (
          <div key={lineIndex} className={`flex flex-col ${alignClass}`}>
            {isMulti && lineIndex === 1 && (
              <div
                className={`mb-3 h-px w-16 bg-white/90 sm:w-24 ${align === 'center' ? 'mx-auto' : ''}`}
                aria-hidden
              />
            )}
            <span
              className={
                isMain && isMulti
                  ? 'text-4xl font-extrabold tracking-[0.12em] text-white sm:text-6xl md:text-7xl lg:text-8xl'
                  : isMain
                    ? 'text-4xl font-extrabold tracking-[0.18em] text-white sm:text-5xl md:text-6xl lg:text-7xl'
                    : 'text-xl font-semibold tracking-[0.35em] text-white sm:text-2xl md:text-3xl'
              }
            >
              {[...line].map((char, charIndex) => {
                const key = `${lineIndex}-${charIndex}`
                return (
                  <span
                    key={key}
                    className={`letter ${visible.has(key) ? 'is-visible' : ''}`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Rain() {
  const drops = useMemo(
    () =>
      Array.from({ length: RAIN_COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        height: `${12 + Math.random() * 28}px`,
        duration: `${0.6 + Math.random() * 0.9}s`,
        delay: `${Math.random() * 2.5}s`,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    [],
  )

  return (
    <div className="rain-layer absolute inset-0 z-[2]" aria-hidden>
      {drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{
            left: d.left,
            height: d.height,
            opacity: d.opacity,
            animationDuration: d.duration,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Full-width cinematic hero banner.
 */
export default function HeroBanner({
  image,
  titleLines = ['MNL', 'BLNCVR'],
  animateTitle = false,
  subtitle,
  align = 'left',
}) {
  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden sm:h-[78vh] sm:min-h-[520px]">
      {/* Base image + city light flicker */}
      <div
        className="hero-lights absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Height / atmospheric fog */}
      <div className="hero-fog absolute inset-0 z-[1]" aria-hidden />

      {/* Animated rain */}
      <Rain />

      {/* Vignette: clear top → dark bottom scrim for text */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,0.92) 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.45) 100%)',
        }}
        aria-hidden
      />

      {/* Title block */}
      <div
        className={`absolute inset-0 z-[4] flex ${
          align === 'center' ? 'items-center justify-center' : 'items-end'
        }`}
      >
        <div
          className={`mx-auto w-full max-w-7xl px-5 ${
            align === 'center' ? 'pb-0 text-center' : 'pb-14 sm:pb-20'
          } sm:px-8`}
        >
          {subtitle && (
            <p
              className={`mb-3 text-xs font-medium tracking-[0.25em] text-white/60 uppercase ${
                align === 'center' ? 'text-center' : ''
              }`}
            >
              {subtitle}
            </p>
          )}
          <AnimatedTitle lines={titleLines} animate={animateTitle} align={align} />
        </div>
      </div>
    </section>
  )
}
