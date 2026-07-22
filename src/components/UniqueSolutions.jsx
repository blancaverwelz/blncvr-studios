import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SolutionsCenterpiece from './SolutionsCenterpiece'

// Four chapters — one dominant capability at a time, never a grid.
const CHAPTERS = [
  {
    num: '01',
    title: 'Design & Development',
    desc: 'Interfaces built to communicate clearly and perform flawlessly — considered design paired with clean, scalable engineering.',
  },
  {
    num: '02',
    title: '3D Web Experiences',
    desc: 'Real-time 3D and interaction woven into the browser, turning a website into something worth remembering.',
  },
  {
    num: '03',
    title: 'Motion Design',
    desc: 'Motion with intent. Every transition guides attention and gives the interface a sense of life.',
  },
  {
    num: '04',
    title: 'Visual Identity',
    desc: 'A consistent visual language — typography, color, and detail working together as one distinctive voice.',
  },
]

// Scroll-progress bands (0 → 1 across the pinned scroll distance).
const ARRIVAL_END = 0.08
const EMERGE_END = 0.18
const CHAPTERS_START = 0.18
const CHAPTERS_END = 0.86
const CHAPTER_WIDTH = (CHAPTERS_END - CHAPTERS_START) / CHAPTERS.length
const CLOSING_START = 0.9

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t

function ProjectsButton({ className = '' }) {
  return (
    <Link
      to="/projects"
      aria-label="View all projects"
      className={`group flex shrink-0 items-center justify-center rounded-full bg-[var(--color-neon-teal)] text-[#05060a] shadow-[0_0_24px_rgba(255,211,1,0.28),0_0_52px_rgba(255,211,1,0.12)] transition duration-300 hover:scale-105 hover:bg-[#ffe05a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-neon-teal)] ${className}`}
    >
      <ArrowUpRight
        strokeWidth={3.25}
        className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
      />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Cinematic, scroll-driven experience (default).                     */
/* ------------------------------------------------------------------ */

function CinematicExperience() {
  const wrapperRef = useRef(null)
  const centerpieceRef = useRef(null)
  const parallaxRef = useRef(null)
  const lastPhaseRef = useRef(null)

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = null

    function computeProgress() {
      rafId = null
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? clamp(-rect.top / total) : 0
      setProgress(p)
    }

    function onScroll() {
      if (rafId == null) rafId = requestAnimationFrame(computeProgress)
    }

    computeProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Derived, per-frame values — all pure functions of scroll progress.
  const headlineOpacity = 1 - smoothstep(0.05, ARRIVAL_END + 0.05, progress)
  const headlineShiftPx = lerp(0, -24, smoothstep(0.05, ARRIVAL_END + 0.05, progress))
  const eyebrowOpacity = 1 - smoothstep(0.03, ARRIVAL_END, progress)

  const centerpieceEnter = smoothstep(0.08, EMERGE_END, progress)
  const centerpieceRecede = smoothstep(CLOSING_START, 0.99, progress)
  const centerpieceOpacity = centerpieceEnter * (1 - centerpieceRecede * 0.65)
  const centerpieceScale = lerp(0.82, 1, centerpieceEnter) * lerp(1, 0.92, centerpieceRecede)

  const chapterIndexRaw = (progress - CHAPTERS_START) / CHAPTER_WIDTH
  const activeChapter = clamp(Math.floor(chapterIndexRaw), 0, CHAPTERS.length - 1)

  const closingOpacity = smoothstep(CLOSING_START, 0.98, progress)
  const closingShiftPx = lerp(20, 0, smoothstep(CLOSING_START, 0.98, progress))

  // Drive the 3D centerpiece's posture without re-rendering on every tick.
  useEffect(() => {
    let phase
    if (progress >= CHAPTERS_END) phase = 'rest'
    else if (progress >= CHAPTERS_START) phase = activeChapter
    else phase = null

    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase
      if (phase !== null) centerpieceRef.current?.setActive(phase)
    }
  }, [progress, activeChapter])

  // Gentle cursor parallax on the centerpiece (desktop only).
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) return

    const el = parallaxRef.current
    if (!el) return

    function handleMove(e) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`
    }
    function handleLeave() {
      el.style.transform = 'translate3d(0, 0, 0)'
    }

    window.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative h-[640vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#05060a]">
        {/* Ambient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 78% 20%, rgba(255,211,1,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-5 sm:px-8">
          {/* Arrival: eyebrow + headline */}
          <div
            className="pointer-events-none absolute inset-x-5 top-[18%] mx-auto max-w-4xl text-center sm:inset-x-8"
            style={{
              opacity: headlineOpacity,
              transform: `translate3d(0, ${headlineShiftPx}px, 0)`,
            }}
          >
            <span
              className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase"
              style={{ opacity: eyebrowOpacity }}
            >
              What I Do
            </span>
            <h2 className="mt-5 text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
              Tailoring unique solutions for your next breakthrough.
            </h2>
          </div>

          {/* Emergence: sculptural centerpiece, always present, evolves per chapter */}
          <div
            ref={parallaxRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              opacity: centerpieceOpacity,
              transform: `scale(${centerpieceScale})`,
            }}
          >
            <div className="w-[min(70vw,26rem)]">
              <SolutionsCenterpiece ref={centerpieceRef} />
            </div>
          </div>

          {/* Chapters: one capability at a time */}
          {CHAPTERS.map((chapter, index) => {
            const bandStart = CHAPTERS_START + index * CHAPTER_WIDTH
            const local = clamp((progress - bandStart) / CHAPTER_WIDTH)
            const opacity = Math.min(smoothstep(0, 0.2, local), 1 - smoothstep(0.8, 1, local))
            const shiftPx = 18 * (1 - smoothstep(0, 0.2, local)) - 18 * smoothstep(0.8, 1, local)

            return (
              <div
                key={chapter.num}
                className="pointer-events-none absolute inset-x-5 bottom-[12%] mx-auto max-w-2xl text-center sm:inset-x-8"
                style={{
                  opacity,
                  transform: `translate3d(0, ${shiftPx}px, 0)`,
                }}
              >
                <span className="text-sm font-extrabold tracking-[0.2em] text-[var(--color-neon-teal)]">
                  {chapter.num}
                </span>
                <h3 className="mt-3 text-[clamp(1.75rem,4vw,3rem)] leading-[1.02] font-extrabold tracking-tight text-white">
                  {chapter.title}
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  {chapter.desc}
                </p>
              </div>
            )
          })}

          {/* Convergence / Editorial closing */}
          <div
            className="absolute inset-x-5 bottom-[10%] mx-auto max-w-3xl text-center sm:inset-x-8"
            style={{
              opacity: closingOpacity,
              transform: `translate3d(0, ${closingShiftPx}px, 0)`,
              pointerEvents: closingOpacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <p className="text-2xl leading-tight font-medium text-white/90 sm:text-3xl">
              Every interaction.
              <br />
              Every frame.
              <br />
              Every experience.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="text-sm text-white/50">View the work</span>
              <ProjectsButton className="h-14 w-14 [&_svg]:h-6 [&_svg]:w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reduced-motion fallback — same narrative, no scroll hijacking.     */
/* ------------------------------------------------------------------ */

function Reveal({ show, delayMs = 0, className = '', children }) {
  return (
    <div
      className={`transition-all duration-[800ms] ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: show ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function StaticExperience() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
      <Reveal show={visible}>
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase">
          What I Do
        </span>
        <h2 className="mt-5 text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
          Tailoring unique solutions for your next breakthrough.
        </h2>
      </Reveal>

      <Reveal show={visible} delayMs={100} className="mx-auto mt-14 w-[min(70vw,20rem)]">
        <SolutionsCenterpiece />
      </Reveal>

      <div className="mt-14 flex flex-col gap-14">
        {CHAPTERS.map((chapter, i) => (
          <Reveal key={chapter.num} show={visible} delayMs={150 + i * 90}>
            <span className="text-sm font-extrabold tracking-[0.2em] text-[var(--color-neon-teal)]">
              {chapter.num}
            </span>
            <h3 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-3xl">
              {chapter.title}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              {chapter.desc}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal show={visible} delayMs={150 + CHAPTERS.length * 90} className="mt-16 border-t border-white/10 pt-10">
        <p className="text-2xl leading-tight font-medium text-white/90 sm:text-3xl">
          Every interaction.
          <br />
          Every frame.
          <br />
          Every experience.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-white/50">View the work</span>
          <ProjectsButton className="h-14 w-14 [&_svg]:h-6 [&_svg]:w-6" />
        </div>
      </Reveal>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function UniqueSolutions() {
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  return (
    <section className="relative w-full overflow-hidden bg-[#05060a]">
      {reducedMotion ? <StaticExperience /> : <CinematicExperience />}
    </section>
  )
}
